import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePushNotifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push Notifications are only supported on native platforms.');
            return;
        }

        const setUpPushNotifications = async () => {
            console.log('Setting up push notifications...');
            try {
                // Create the notification channel for Android (High Importance for Heads-up)
                if (Capacitor.getPlatform() === 'android') {
                    await FirebaseMessaging.createChannel({
                        id: 'push_notifications',
                        name: 'Notificaciones Generales',
                        description: 'Notificaciones generales de la aplicación',
                        importance: 5, // 5 = Max (Heads-up), 4 = High, 3 = Default
                        visibility: 1,
                        sound: 'default',
                        vibration: true,
                    });
                    console.log('Android Notification Channel created');
                }

                // Request permission to use push notifications
                const result = await FirebaseMessaging.requestPermissions();
                console.log('Push permission result:', JSON.stringify(result));

                if (result.receive === 'granted') {
                    // Register with Apple / Google to receive push via APNS/FCM
                    console.log('Permission granted, fetching token...');
                    const { token } = await FirebaseMessaging.getToken();
                    console.log('FCM Token:', token);
                    saveTokenToSupabase(token);
                } else {
                    console.warn('Push notification permission denied');
                    toast.error('Permiso de notificaciones denegado', {
                        description: 'Habilítalas en Ajustes para recibir mensajes.'
                    });
                }
            } catch (error) {
                console.error('Error setting up push notifications:', error);
                toast.error('Error configurando notificaciones', { description: JSON.stringify(error) });
            }
        };

        const saveTokenToSupabase = async (token: string) => {
            if (user) {
                try {
                    const { error } = await supabase
                        .from('user_push_tokens')
                        .upsert({
                            user_id: user.id,
                            token: token,
                            platform: Capacitor.getPlatform() === 'ios' ? 'ios' : 'android',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id, token' });

                    if (error) {
                        console.error('Error saving push token to Supabase:', error);
                    } else {
                        console.log('Push token saved to Supabase');
                    }
                } catch (e) {
                    console.error('Exception saving push token:', e);
                }
            } else {
                console.warn('User not authenticated, cannot save token yet.');
            }
        };

        // Listeners

        // Token refresh listener
        // Note: FirebaseMessaging doesn't have a 'registration' event like the old plugin,
        // it uses getToken() and optionally a token refresh listener if the token changes.
        // But for simplicity/robustness we just call getToken() on startup.

        // Listeners variables
        let receivedListener: Promise<import("@capacitor/core").PluginListenerHandle>;
        let actionListener: Promise<import("@capacitor/core").PluginListenerHandle>;

        // Check for initial notification (Cold Start)
        FirebaseMessaging.getDeliveredNotifications().then((res) => {
            // This is a workaround as sometimes getDeliveredNotifications includes the one tapped
            // Ideally we rely on the listener, but for cold start we might need to check if we were launched by a notification.
            // However, Capacitor Firebase Messaging handles 'notificationActionPerformed' even on cold start usually.
            // If it's failing, we might need to ensure the listener is registered BEFORE the event fires, which is tricky in React useEffect.
            console.log('Delivered notifications on start:', res);
        });

        // Add Listeners
        const addListeners = async () => {
            await FirebaseMessaging.removeAllListeners();

            // Notification received listener
            receivedListener = FirebaseMessaging.addListener('notificationReceived',
                (event) => {
                    console.log('Push received: ' + JSON.stringify(event));
                    const notification = event.notification;
                    toast(notification.title || 'Nueva notificación', {
                        description: notification.body,
                    });
                }
            );

            // Notification action listener
            actionListener = FirebaseMessaging.addListener('notificationActionPerformed',
                (event) => {
                    console.log('Push action performed: ' + JSON.stringify(event));

                    const data = event.notification.data as { url?: string; conversationId?: string } | undefined;
                    if (data?.url) {
                        console.log('Navigating to:', data.url);
                        // Small timeout to ensure router is ready
                        setTimeout(() => navigate(data.url), 100);
                    } else if (data?.conversationId) {
                        // Fallback if only conversationId is present
                        console.log('Navigating to coach chat for conversation:', data.conversationId);
                        setTimeout(() => navigate('/coach-chat'), 100);
                    }
                }
            );
        };

        setUpPushNotifications();
        addListeners();

        // Cleanup listeners
        return () => {
            if (receivedListener) receivedListener.then(listener => listener.remove());
            if (actionListener) actionListener.then(listener => listener.remove());
        };
    }, [user]);
};
