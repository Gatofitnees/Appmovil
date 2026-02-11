import React, { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Dialog } from '@capacitor/dialog';
import { supabase } from '@/integrations/supabase/client';

export const AppUpdateChecker: React.FC = () => {
    useEffect(() => {
        const checkUpdate = async () => {
            // Only run on native platforms
            if (!Capacitor.isNativePlatform()) return;

            try {
                // 1. Get current app version
                const appInfo = await App.getInfo();
                const currentVersion = appInfo.version; // e.g., "1.0.0"

                // 2. Fetch remote config
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('setting_value')
                    .eq('setting_key', 'mobile_app_version')
                    .maybeSingle();

                if (error || !data || !data.setting_value) {
                    console.error('Error fetching app version config:', error);
                    return;
                }

                const config = data.setting_value as any;
                const platform = Capacitor.getPlatform(); // 'ios' or 'android'
                const platformConfig = config[platform];

                if (!platformConfig) return;

                const latestVersion = platformConfig.latest_version;
                const storeUrl = platformConfig.store_url;

                // 3. Compare versions
                if (compareVersions(latestVersion, currentVersion) > 0) {
                    // Update available
                    const { value } = await Dialog.confirm({
                        title: 'Actualización disponible',
                        message: `Hay una nueva versión de Gatofit (${latestVersion}). Actualiza para obtener las últimas funciones y correcciones.`,
                        okButtonTitle: 'Actualizar',
                        cancelButtonTitle: 'Más tarde',
                    });

                    if (value) {
                        await Browser.open({ url: storeUrl });
                    }
                }
            } catch (err) {
                console.error('Error checking for updates:', err);
            }
        };

        checkUpdate();
    }, []);

    return null;
};

// Helper function to compare semantic versions
const compareVersions = (v1: string, v2: string): number => {
    // Remove any non-numeric/dot characters potentially (though standard is simple)
    const cleanV1 = v1.replace(/[^0-9.]/g, '');
    const cleanV2 = v2.replace(/[^0-9.]/g, '');

    const parts1 = cleanV1.split('.').map(Number);
    const parts2 = cleanV2.split('.').map(Number);

    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;

        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }

    return 0;
};
