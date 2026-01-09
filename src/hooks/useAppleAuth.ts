import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlatform } from './usePlatform';
import { useToast } from '@/hooks/use-toast';
import { SignInWithApple } from '@capacitor-community/apple-sign-in';

// Generate a random nonce for Apple Sign-In to mitigate replay attacks
const generateNonce = (length = 32) => {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
};

const sha256 = async (message: string) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const useAppleAuth = () => {
  const [loading, setLoading] = useState(false);
  const { isNative, isIOS } = usePlatform();
  const { toast } = useToast();

  // Native Apple Sign-In (iOS only)
  const signInWithNativeApple = async () => {
    try {
      console.log('🔐 Iniciando autenticación Apple nativa...');
      
      if (!isIOS) {
        throw new Error('Apple Sign-In solo está disponible en iOS');
      }

      // Prepare nonce for Apple Sign-In to mitigate replay attacks
      const rawNonce = generateNonce();
      const hashedNonce = await sha256(rawNonce);

      // Perform native Apple sign-in
      const result = await SignInWithApple.authorize({
        clientId: 'com.gatofit.app',
        teamId: '9466F5H2BT',
        redirectURI: 'https://mwgnpexeymgpzibnkiof.supabase.co/auth/v1/callback',
        scope: 'email name',
        usePopup: false,
        nonce: hashedNonce,
      });

      console.log('✅ Usuario de Apple obtenido:', result);

      const appleIdentityToken = (result as any).identityToken || (result as any).response?.identityToken;

      if (!appleIdentityToken) {
        console.error('❌ No se recibió identityToken de Apple');
        throw new Error('Apple no devolvió el token de identificación (identityToken faltante)');
      }

      // Authenticate with Supabase using Apple ID token
      console.log('📤 Enviando identityToken a Supabase...');
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: appleIdentityToken,
        // Supabase expects the raw (unhashed) nonce
        nonce: rawNonce,
      });

      if (error) {
        console.error('❌ Error autenticando con Supabase (Apple id_token flow):', {
          status: (error as any)?.status,
          name: (error as any)?.name,
          message: (error as any)?.message,
        });
        throw error;
      }

      console.log('✅ Autenticación nativa con Apple exitosa');
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ Error en autenticación nativa con Apple:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);

      // User cancelled
      if (error.message?.includes('cancel') || error.message?.includes('popup_closed')) {
        return { data: null, error: { message: 'Autenticación cancelada' } };
      }

      throw error;
    }
  };

  // Web OAuth Apple Sign-In (fallback)
  const signInWithOAuthApple = async () => {
    try {
      const currentOrigin = window.location.origin;
      console.log('🌐 Iniciando autenticación Apple web:', currentOrigin);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${currentOrigin}/onboarding/app-transition`,
          scopes: 'email name'
        },
      });

      if (error) {
        console.error('Apple sign-in error:', error);
        throw error;
      }

      console.log('Apple OAuth iniciado:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error en OAuth Apple:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    setLoading(true);

    try {
      let result;

      // Use native auth on iOS - NO fallback to OAuth
      if (isNative && isIOS) {
        console.log('🚀 Usando autenticación nativa para iOS');
        result = await signInWithNativeApple();

        // If native fails, report the error directly (no OAuth fallback)
        if (result.error) {
          const error = result.error as any;
          if (error.message === 'Autenticación cancelada') {
            return result;
          }
          console.error('❌ Autenticación nativa con Apple falló:', error);
        }
      } else {
        console.log('🌐 Usando OAuth web');
        result = await signInWithOAuthApple();
      }

      return result;
    } catch (error: any) {
      console.error('Apple auth error:', error);

      let errorMessage = "Error al iniciar sesión con Apple";

      if (error.message?.includes('requested path is invalid')) {
        errorMessage = "Error de configuración. Por favor, contacta al administrador.";
      } else if (error.message?.includes('redirect')) {
        errorMessage = "Error de redirección. Inténtalo de nuevo.";
      } else if (error.message?.includes('identityToken') || error.message?.includes('token')) {
        errorMessage = "No se pudo obtener el token de Apple. Intenta de nuevo.";
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
    signInWithApple,
    loading,
    isNative,
    isIOS
  };
};
