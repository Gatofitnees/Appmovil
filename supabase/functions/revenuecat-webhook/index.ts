
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // DEBUG: Log all incoming headers for diagnostics
        console.log('📋 Incoming headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

        // 1. Validate Authorization Header (using dedicated RevenueCat auth token)
        const authHeader = req.headers.get('Authorization')?.trim();
        const expectedAuthToken = Deno.env.get('REVENUECAT_WEBHOOK_AUTH')?.trim();

        console.log(`🔑 Auth header: ${authHeader ? authHeader.substring(0, 20) + '...' : 'MISSING'}`);
        console.log(`🔑 Expected token: ${expectedAuthToken ? expectedAuthToken.substring(0, 20) + '...' : 'NOT SET'}`);

        if (!authHeader || !expectedAuthToken || authHeader !== expectedAuthToken) {
            console.warn('⚠️ Unauthorized - Header:', !!authHeader, 'Token set:', !!expectedAuthToken, 'Match:', authHeader === expectedAuthToken);
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log('✅ Webhook authenticated successfully');

        const { event } = await req.json();
        if (!event) {
            throw new Error('No event data provided');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const userId = event.app_user_id;
        const type = event.type; // INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION
        const productId = event.product_id;
        const eventId = event.id; // Unique event ID from RevenueCat

        console.log(`📥 Received RevenueCat event: ${type} for user ${userId} (${productId})`);

        // Validar user_id (ignorar usuarios anónimos de RevenueCat si no se mapearon)
        if (!userId || userId.startsWith('$RCAnonymous')) {
            console.log('Skipping anonymous user');
            return new Response(JSON.stringify({ skipped: true, reason: 'anonymous_user' }), { headers: { 'Content-Type': 'application/json' } });
        }

        // 2. Idempotency Check - prevent duplicate processing
        const { data: existingEvent } = await supabase
            .from('webhook_events')
            .select('id')
            .eq('event_id', eventId)
            .single();

        if (existingEvent) {
            console.log(`⏭️ Event ${eventId} already processed - skipping`);
            return new Response(
                JSON.stringify({ success: true, message: 'Event already processed' }),
                { headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 3. Log webhook event for audit trail
        await supabase.from('webhook_events').insert({
            event_id: eventId,
            event_type: type,
            user_id: userId,
            payload: event
        });

        // Mapear datos
        const planType = (productId && (productId.includes('year') || productId.includes('anual') || productId.includes('yearly') || productId.includes('influencer')))
            ? 'yearly'
            : 'monthly';

        const purchasedAt = event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : new Date().toISOString();
        const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

        // Preparar objeto de actualización
        const subscriptionData: any = {
            user_id: userId,
            updated_at: new Date().toISOString(),
            revenuecat_original_transaction_id: event.original_transaction_id,
            store_platform: event.store // app_store, play_store
        };

        // Lógica por tipo de evento
        switch (type) {
            case 'INITIAL_PURCHASE':
            case 'RENEWAL':
            case 'UNCANCELLATION':
            case 'PRODUCT_CHANGE': // Upgrade/Downgrade
                subscriptionData.status = 'active';
                subscriptionData.auto_renewal = true;
                subscriptionData.plan_type = planType;
                if (expiresAt) subscriptionData.expires_at = expiresAt;
                if (type === 'INITIAL_PURCHASE') subscriptionData.started_at = purchasedAt;
                subscriptionData.cancelled_at = null; // Limpiar cancelación si existe
                break;

            case 'CANCELLATION':
                // IMPORTANTE: Cancelación no significa expiración inmediata.
                // Significa que NO se renovará. El usuario sigue siendo premium hasta expires_at.
                subscriptionData.status = 'active';
                subscriptionData.auto_renewal = false;
                subscriptionData.cancelled_at = new Date().toISOString();
                if (expiresAt) subscriptionData.expires_at = expiresAt;
                break;

            case 'EXPIRATION':
                subscriptionData.status = 'expired';
                subscriptionData.auto_renewal = false;
                if (expiresAt) subscriptionData.expires_at = expiresAt;
                break;

            case 'TEST':
                console.log('Test event received');
                return new Response(JSON.stringify({ success: true, message: 'Test event received' }), { headers: { 'Content-Type': 'application/json' } });

            default:
                console.log(`Unhandled event type: ${type}`);
                // No devolvemos error para que RC no reintente infinitamente eventos que no nos importan
                return new Response(JSON.stringify({ success: true, message: 'Unhandled event type' }), { headers: { 'Content-Type': 'application/json' } });
        }

        // Upsert a la base de datos
        const { error } = await supabase
            .from('user_subscriptions')
            .upsert(subscriptionData, { onConflict: 'user_id' });

        if (error) {
            console.error('Error updating subscription:', error);
            throw error;
        }

        console.log(`✅ Successfully handled ${type} for ${userId}`);

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('❌ Webhook Error:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
