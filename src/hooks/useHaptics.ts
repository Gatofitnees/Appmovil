import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useCallback } from 'react';

export const useHaptics = () => {
    // Light vibration for selection changes (e.g. tabs, list items)
    const hapticSelection = useCallback(async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.selectionStart();
                await Haptics.selectionChanged();
                await Haptics.selectionEnd();
            } catch (error) {
                console.error('Haptics selection error:', error);
            }
        }
    }, []);

    // Impact feedback (Light, Medium, Heavy)
    const hapticImpact = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.impact({ style });
            } catch (error) {
                console.error('Haptics impact error:', error);
            }
        }
    }, []);

    // Notification feedback (Success, Warning, Error)
    const hapticNotification = useCallback(async (type: NotificationType = NotificationType.Success) => {
        if (Capacitor.isNativePlatform()) {
            try {
                await Haptics.notification({ type });
            } catch (error) {
                console.error('Haptics notification error:', error);
            }
        }
    }, []);

    return {
        hapticSelection,
        hapticImpact,
        hapticNotification,
        ImpactStyle,
        NotificationType
    };
};
