
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gatofit.app',
  appName: 'Gatofit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      '*.youtube.com',
      '*.youtu.be',
      '*.google.com',
      '*.googleapis.com'
    ]
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '175681669860-6r9ejdog30rsm6l5auge5bmdnrak4n6e.apps.googleusercontent.com',
      iosClientId: '175681669860-ionmff8fd0d0ob3iohoojtcvs34l7egp.apps.googleusercontent.com',
      androidClientId: '175681669860-fm9162dclnf6aditt71kcij2ri0jlped.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    AppleSignIn: {
      clientId: 'com.gatofit.app',
      teamId: '9466F5H2BT',
      redirectURI: 'https://mwgnpexeymgpzibnkiof.supabase.co/auth/v1/callback',
      scope: 'email name'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#3B82F6',
      sound: 'default'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: true,
      // Enable edge-to-edge for Android 15+
      androidEdgeToEdge: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: 'never',
    scrollEnabled: false
  }
};

export default config;
