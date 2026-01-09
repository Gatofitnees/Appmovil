import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatform } from './usePlatform';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const IOS_CLIENT_ID = '175681669860-ionmff8fd0d0ob3iohoojtcvs34l7egp.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '175681669860-fm9162dclnf6aditt71kcij2ri0jlped.apps.googleusercontent.com';
const SERVER_CLIENT_ID = '175681669860-6r9ejdog30rsm6l5auge5bmdnrak4n6e.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { isNative, isAndroid, isIOS } = usePlatform();
  const { toast } = useToast();
  const initializedRef = useRef(false);

  const ensureInitialized = async () => {
    if (initializedRef.current) return;
    try {
      // IMPORTANT: For Android, we must use the SERVER_CLIENT_ID (Web Client ID) 
      // to get a valid idToken that works with Supabase.
      // The Android Client ID is handled automatically by Google Play Services via SHA-1 fingerprint.
      // For iOS, we use the iOS Client ID.
      const clientId = isAndroid ? SERVER_CLIENT_ID : IOS_CLIENT_ID;
      console.log(`🔧 Inicializando GoogleAuth para ${isAndroid ? 'Android' : 'iOS'}`);
      console.log(`🔑 Usando clientId: ${clientId.substring(0, 30)}...`);
      
      await GoogleAuth.initialize({
        clientId: clientId,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
      initializedRef.current = true;
      console.log('✅ GoogleAuth inicializado correctamente');
    } catch (initError) {
      console.error('❌ Error inicializando GoogleAuth:', initError);
      // No lanzamos para no bloquear; el plugin seguirá intentando leer config
    }
  };

  // Native Google Sign-In (Android/iOS)
  const signInWithNativeGoogle = async () => {
    try {
      console.log('🔐 Iniciando autenticación Google nativa...');

      // Necesario para evitar crash en el plugin (googleSignIn nil si no se inicializa)
      await ensureInitialized();
      
      // No need to call initialize() for native - it auto-configures from capacitor.config.ts
      
      // Open native Google account picker
      const googleUser = await GoogleAuth.signIn();
      console.log('✅ Usuario de Google obtenido:', googleUser.email);
      console.log('🔍 Google User completo:', JSON.stringify(googleUser));
      
      // Check if idToken exists
      if (!googleUser.authentication.idToken) {
        console.error('❌ No se recibió idToken de Google');
        throw new Error('No se pudo obtener el token de autenticación de Google (idToken faltante)');
      }
      
      console.log('🎫 idToken recibido:', googleUser.authentication.idToken.substring(0, 50) + '...');
      
      // Authenticate with Supabase using Google ID token
      console.log('📤 Enviando idToken a Supabase...');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleUser.authentication.idToken,
      });
      
      if (error) {
        console.error('❌ Error autenticando con Supabase:', error);
        console.error('❌ Error details:', JSON.stringify(error));
        console.error('❌ Tipo de error:', error.name);
        console.error('❌ Status:', (error as any).status);
        throw error;
      }
      
      console.log('✅ Autenticación nativa exitosa');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error en autenticación nativa:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // User cancelled
      if (error.message?.includes('cancel') || error.message?.includes('popup_closed')) {
        return { data: null, error: { message: 'Autenticación cancelada' } };
      }
      
      throw error;
    }
  };

  // Web OAuth Google Sign-In
  const signInWithOAuthGoogle = async () => {
    try {
      const currentOrigin = window.location.origin;
      console.log('🌐 Iniciando autenticación Google web:', currentOrigin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentOrigin}/onboarding/app-transition`,
          queryParams: {
            prompt: 'select_account'
          }
        },
      });
      
      if (error) {
        console.error('Google sign-in error:', error);
        throw error;
      }
      
      console.log('Google OAuth iniciado:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error en OAuth Google:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    
    try {
      let result;
      
      // Always use native auth on mobile platforms - NO fallback to OAuth
      if (isNative) {
        console.log(`🚀 Usando autenticación nativa para ${isAndroid ? 'Android' : 'iOS'}`);
        result = await signInWithNativeGoogle();
        
        // If native fails, report the error directly (no OAuth fallback)
        if (result.error) {
          const error = result.error as any;
          if (error.message === 'Autenticación cancelada') {
            return result;
          }
          console.error('❌ Autenticación nativa falló:', error);
        }
      } else {
        console.log('🌐 Usando OAuth web');
        result = await signInWithOAuthGoogle();
      }
      
      return result;
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      let errorMessage = "Error al iniciar sesión con Google";
      
      if (error.message?.includes('requested path is invalid')) {
        errorMessage = "Error de configuración. Por favor, contacta al administrador.";
      } else if (error.message?.includes('redirect')) {
        errorMessage = "Error de redirección. Inténtalo de nuevo.";
      } else if (error.message?.includes('idToken')) {
        errorMessage = "No se pudo obtener el token de Google. Intenta de nuevo.";
      } else if (error.message?.includes('Supabase') || error.message?.includes('status') || error.message?.includes('AuthRetryable')) {
        errorMessage = "Error de conexión con el servidor. Verifica tu conexión a internet e intenta de nuevo.";
      } else if (error.message !== 'Autenticación cancelada') {
        errorMessage = error.message || "Error desconocido";
      }
      
      if (error.message !== 'Autenticación cancelada') {
        toast({
          title: errorMessage,
          description: error.message || "Error desconocido",
          variant: "destructive"
        });
      }
      
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
    isNative,
    isAndroid,
    isIOS
  };
};
