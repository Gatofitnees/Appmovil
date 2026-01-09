
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { createSecureErrorMessage, logSecurityEvent } from "@/utils/errorHandling";
import { useAutoProfileSetup } from "@/hooks/useAutoProfileSetup";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useAppleAuth } from "@/hooks/useAppleAuth";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signInWithApple: () => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { signInWithGoogle: googleSignIn, loading: googleLoading } = useGoogleAuth();
  const { signInWithApple: appleSignIn, loading: appleLoading } = useAppleAuth();

  // Auto-setup profile for Google users
  useAutoProfileSetup(user);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logSecurityEvent('session_load_error', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Log authentication events for security monitoring
      if (_event === 'SIGNED_IN') {
        logSecurityEvent('user_signed_in', 'User authentication successful', session?.user?.id);
      } else if (_event === 'SIGNED_OUT') {
        logSecurityEvent('user_signed_out', 'User signed out', session?.user?.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Basic input validation
      if (!email || !password) {
        const error = { message: 'Email y contraseña son requeridos' };
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      if (password.length < 6) {
        const error = { message: 'La contraseña debe tener al menos 6 caracteres' };
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        const secureError = createSecureErrorMessage(error, 'auth');
        logSecurityEvent('signup_failed', error.message);
        toast({
          title: "Error de registro",
          description: secureError,
          variant: "destructive",
        });
        return { error, data: null };
      }

      // Profile creation is now handled automatically by database trigger
      // No need to manually create profile here anymore

      toast({
        title: "Cuenta creada",
        description: "Por favor, verifica tu email",
      });

      logSecurityEvent('user_registered', 'New user registration', data.user?.id);
      return { error: null, data };
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('signup_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Basic input validation
      if (!email || !password) {
        const error = { message: 'Email y contraseña son requeridos' };
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        const secureError = createSecureErrorMessage(error, 'auth');
        logSecurityEvent('signin_failed', error.message);
        toast({
          title: "Error de inicio de sesión",
          description: secureError,
          variant: "destructive",
        });
        return { error, data: null };
      }

      // Removed login success toast to prevent repeated messages
      logSecurityEvent('user_login', 'User login successful', data.user?.id);
      return { error: null, data };
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('signin_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signInWithGoogle = async () => {
    try {
      logSecurityEvent('google_signin_initiated', 'Google OAuth initiated');
      return await googleSignIn();
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('google_signin_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signInWithApple = async () => {
    try {
      logSecurityEvent('apple_signin_initiated', 'Apple OAuth initiated');
      return await appleSignIn();
    } catch (err: any) {
      const secureError = createSecureErrorMessage(err, 'auth');
      logSecurityEvent('apple_signin_error', err.message);
      toast({
        title: "Error",
        description: secureError,
        variant: "destructive",
      });
      return { error: err, data: null };
    }
  };

  const signOut = async () => {
    try {
      const userId = user?.id;

      // Clear local state immediately for faster UI response
      setUser(null);
      setSession(null);

      // Log security event before signout
      logSecurityEvent('user_signout', 'User initiated signout', userId);

      // Show toast immediately
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });

      // Perform signout in background without awaiting
      // This prevents the UI from being blocked
      supabase.auth.signOut().catch((err) => {
        logSecurityEvent('signout_error', 'Error during background signout');
        console.error('Error signing out (background):', err);
      });

    } catch (err) {
      logSecurityEvent('signout_error', 'Error during signout');
      console.error('Error signing out:', err);
      // Still clear state even if there's an error
      setUser(null);
      setSession(null);
    }
  };

  const value = React.useMemo(() => ({
    session,
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signOut,
    loading: loading || googleLoading || appleLoading,
  }), [session, user, loading, googleLoading, appleLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
