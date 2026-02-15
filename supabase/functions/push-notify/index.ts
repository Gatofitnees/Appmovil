import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create as createJWT, getNumericDate } from "https://deno.land/x/djwt@v2.9/mod.ts";

interface NotificationPayload {
    type: 'INSERT' | 'UPDATE' | 'DELETE'
    table: string
    record: any
    schema: string
    old_record: null | any
}

interface ServiceAccount {
    project_id: string;
    private_key: string;
    client_email: string;
}

const getAccessToken = async (serviceAccount: ServiceAccount) => {
    const iat = getNumericDate(new Date());
    const exp = getNumericDate(new Date(Date.now() + 3600 * 1000)); // 1 hour

    // Helper to Convert PEM to CryptoKey
    const pem = serviceAccount.private_key.replace(/\n/g, '').replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '');
    const binaryDerString = atob(pem);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const key = await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        false,
        ["sign"]
    );

    const jwt = await createJWT(
        { alg: "RS256", typ: "JWT" },
        {
            iss: serviceAccount.client_email,
            sub: serviceAccount.client_email,
            aud: "https://oauth2.googleapis.com/token",
            iat,
            exp,
            scope: "https://www.googleapis.com/auth/firebase.messaging",
        },
        key
    );

    const params = new URLSearchParams();
    params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
    params.append("assertion", jwt);

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    const data = await res.json();
    return data.access_token;
};

Deno.serve(async (req) => {
    const payload: NotificationPayload = await req.json()

    // Only handle INSERTs
    if (payload.type !== 'INSERT') {
        return new Response(JSON.stringify({ message: 'Ignore non-insert' }), {
            headers: { 'Content-Type': 'application/json' }
        })
    }

    const { record } = payload

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Identify Recipient
    // The chat_messages record only has conversation_id and sender_id.
    // We need to fetch the conversation to find the participants.

    const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('user_id, coach_id')
        .eq('id', record.conversation_id)
        .single()

    if (convError || !conversation) {
        console.error('Error fetching conversation:', convError)
        return new Response(JSON.stringify({ message: 'Conversation not found' }), {
            headers: { 'Content-Type': 'application/json' }
        })
    }

    // Determine recipient: The one who is NOT the sender
    // Note: sender_id in record might be a string, convert to check if needed, but usually Supabase returns string for UUIDs 
    const recipientId = (record.sender_id === conversation.user_id)
        ? conversation.coach_id
        : conversation.user_id;

    // We only want to notify the USER if the message is eligible.
    // We check if the recipient has a token.

    const { data: tokens, error } = await supabase
        .from('user_push_tokens')
        .select('token, platform')
        .eq('user_id', recipientId)

    if (error || !tokens || tokens.length === 0) {
        console.log('No devices registered for recipient:', recipientId)
        return new Response(JSON.stringify({ message: 'No devices found' }), {
            headers: { 'Content-Type': 'application/json' }
        })
    }

    // Get Sender Details
    const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url')
        .eq('id', record.sender_id)
        .single()

    const senderName = senderProfile?.full_name || senderProfile?.username || 'Tu Entrenador'
    const messageBody = record.message_type === 'image' ? '📷 Imagen' : record.content

    // Select Image: Priority 1: Avatar, Priority 2: Message Content (if image)
    let notificationImage = senderProfile?.avatar_url;
    if (!notificationImage && record.message_type === 'image') {
        notificationImage = record.content;
    }

    // 4. Send via FCM HTTP v1 API
    const serviceAccountStr = Deno.env.get('FCM_SERVICE_ACCOUNT');

    if (!serviceAccountStr) {
        console.error('FCM_SERVICE_ACCOUNT not set');
        return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountStr) as ServiceAccount;
        const accessToken = await getAccessToken(serviceAccount);

        const projectId = serviceAccount.project_id;
        const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

        const promises = tokens.map(async (t) => {
            const message = {
                message: {
                    token: t.token,
                    notification: {
                        title: senderName,
                        body: messageBody,
                        image: notificationImage
                    },
                    data: {
                        url: '/coach-chat',
                        conversationId: record.conversation_id,
                        image: notificationImage || ''
                    },
                    // Android specific config for higher priority
                    android: {
                        priority: 'high',
                        notification: {
                            sound: 'default',
                            channel_id: 'default',
                            image: notificationImage
                        }
                    },
                    // iOS specific config
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default',
                                badge: 1,
                                'content-available': 1,
                                'mutable-content': 1
                            }
                        },
                        fcm_options: {
                            image: notificationImage
                        }
                    }
                }
            };

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
                });

                const result = await res.json();

                console.log(`FCM Response ${res.status}:`, JSON.stringify(result));

                if (!res.ok) {
                    console.error('FCM Error for token', t.token, result);
                    throw new Error(JSON.stringify(result));
                }

                if (!result || !result.name) {
                    console.error('Unexpected FCM response format:', result);
                    // fallback if success but no name
                    return { success: true, id: 'unknown' };
                }

                console.log('FCM Success:', result.name);
                return { success: true, id: result.name };
            } catch (error) {
                const err = error as Error;
                console.error('Fetch Error:', err);
                return { success: false, error: { message: err.message, stack: err.stack, cause: err.cause } };
            }
        })

        const results = await Promise.all(promises);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        console.log(`Sent ${successCount} success, ${failureCount} failed`);

        return new Response(JSON.stringify({ success: true, results }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (err) {
        const error = err as Error;
        console.error('Error sending notification:', error);
        return new Response(JSON.stringify({ error: error.message, stack: error.stack, version: 'v5-debug' }), { status: 500 });
    }
})
