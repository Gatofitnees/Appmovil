import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { AppTrackingTransparency } from 'capacitor-plugin-app-tracking-transparency';
import { FacebookEvents } from 'capacitor-facebook-events';

export const useAppTrackingTransparency = () => {
  useEffect(() => {
    const initializeTracking = async () => {
      const platform = Capacitor.getPlatform();

      if (platform === 'ios') {
        try {
          // Check current status first
          const statusResult = await AppTrackingTransparency.getStatus();
          let currentStatus = statusResult.status;

          if (currentStatus === 'notDetermined') {
            // Request permission if not yet determined
            const requestResult = await AppTrackingTransparency.requestPermission();
            currentStatus = requestResult.status;
            console.log('App Tracking Transparency status:', currentStatus);
          } else {
            console.log('App Tracking Transparency already determined:', currentStatus);
          }

          // Enable FB tracking if authorized
          if (currentStatus === 'authorized') {
            await FacebookEvents.setAdvertiserTrackingEnabled({ enabled: true });
            console.log('Facebook Advertiser Tracking Enabled');
          } else {
            await FacebookEvents.setAdvertiserTrackingEnabled({ enabled: false });
            console.log('Facebook Advertiser Tracking Disabled');
          }
        } catch (error) {
          console.error('Error requesting App Tracking Transparency:', error);
        }
      }

      // Log app activation event for Meta Ads on both platforms
      // Ensures RevenueCat can pick up the anonymous ID to attribute purchases
      if (platform === 'ios' || platform === 'android') {
        try {
          await FacebookEvents.logEvent({ event: 'fb_mobile_activate_app' });
          console.log('Facebook SDK initialized: fb_mobile_activate_app logged');
        } catch (error) {
          console.error('Error logging fb_mobile_activate_app:', error);
        }
      }
    };

    // Add a small delay to ensure the app is fully initialized and any other priority popups have a chance to settle
    const timer = setTimeout(() => {
      initializeTracking();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
};
