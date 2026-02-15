import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachAssignment } from '@/hooks/useCoachAssignment';

export const useCoachChatNotifications = () => {
    const { user } = useAuth();
    const { coachId } = useCoachAssignment();
    const location = useLocation();
    const lastNotificationRef = useRef<string | null>(null);

    useEffect(() => {
        // Only run on native platforms or if testing in browser with simulated notifications
        // but Capacitor.isNativePlatform() is the standard check.
        // For development, we might want to log at least.

        if (!user || !coachId) return;

        let channel: any = null;

        const setupSubscription = async () => {
            try {
                // 1. Get Conversation ID
                const { data: conversation } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('coach_id', coachId)
                    .single();

                if (!conversation) return;

                console.log('Setting up Coach Chat subscription for:', conversation.id);

                // 2. Subscribe to messages
                channel = supabase
                    .channel(`notifications:chat:${conversation.id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'chat_messages',
                            filter: `conversation_id=eq.${conversation.id}`
                        },
                        async (payload) => {
                            const newMessage = payload.new as any;

                            // Only notify if:
                            // 1. Sender is the coach
                            // 2. We are NOT currently on the chat page
                            // 3. We haven't just notified for this message (deduplication)

                            const isFromCoach = newMessage.sender_id === coachId;
                            const isOnChatPage = location.pathname === '/coach-chat';

                            if (isFromCoach && !isOnChatPage && lastNotificationRef.current !== newMessage.id) {
                                lastNotificationRef.current = newMessage.id;

                                console.log('New coach message received, triggering notification');

                                // Fetch coach's profile for name and avatar
                                let largeIcon = undefined;
                                let notificationTitle = 'Mensaje de tu Entrenador';

                                const { data: coachProfile } = await supabase
                                    .from('profiles')
                                    .select('full_name, username, avatar_url')
                                    .eq('id', coachId)
                                    .single();

                                if (coachProfile) {
                                    const coachName = coachProfile.full_name || coachProfile.username || 'Tu Entrenador';
                                    notificationTitle = coachName;

                                    if (coachProfile.avatar_url) {
                                        largeIcon = coachProfile.avatar_url;
                                    }
                                }

                                // Schedule Local Notification
                                if (Capacitor.isNativePlatform()) {
                                    await LocalNotifications.schedule({
                                        notifications: [{
                                            id: Date.now(), // Unique ID
                                            title: notificationTitle,
                                            body: newMessage.message_type === 'text'
                                                ? newMessage.content
                                                : (newMessage.message_type === 'image' ? '📷 Te envió una imagen' : '📎 Te envió un archivo'),
                                            schedule: { at: new Date(Date.now() + 100) }, // Immediate
                                            sound: 'notification',
                                            smallIcon: 'ic_stat_icon_config_sample', // Android icon
                                            largeIcon: largeIcon, // Coach's avatar
                                            actionTypeId: 'OPEN_CHAT',
                                            extra: {
                                                url: '/coach-chat'
                                            }
                                        }]
                                    });
                                } else {
                                    // Fallback for web testing
                                    new Notification(notificationTitle, {
                                        body: newMessage.content || 'Nuevo mensaje',
                                        icon: largeIcon // Also works on some desktop browsers
                                    });
                                }
                            }
                        }
                    )
                    .subscribe();

            } catch (error) {
                console.error('Error setting up coach chat notifications:', error);
            }
        };

        setupSubscription();

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, [user, coachId, location.pathname]);
};
