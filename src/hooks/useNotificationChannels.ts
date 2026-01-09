import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

// Android notification channels for v7.x
const setupAndroidChannels = async () => {
  try {
    // Dynamically import PushNotifications to configure channels
    const { PushNotifications } = await import('@capacitor/push-notifications');
    
    // Create workout notifications channel
    PushNotifications.createChannel({
      id: 'gatofit-workouts',
      name: 'Entrenamientos',
      description: 'Notificaciones de entrenamientos diarios',
      importance: 5,
      enableVibration: true,
      enableLights: true,
      lightColor: '#3B82F6',
      sound: 'default',
    });
    
    // Create meal notifications channel
    PushNotifications.createChannel({
      id: 'gatofit-meals',
      name: 'Comidas',
      description: 'Notificaciones de registros de comidas',
      importance: 4,
      enableVibration: true,
      enableLights: true,
      lightColor: '#10B981',
      sound: 'default',
    });
    
    console.log('✅ Android notification channels created successfully');
  } catch (error) {
    // If PushNotifications not available, that's OK - we're using LocalNotifications
    console.log('ℹ️ Notification channels not available (using LocalNotifications)', error);
  }
};

export const useNotificationChannels = () => {
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'android') {
      setupAndroidChannels();
    }
  }, []);
};
