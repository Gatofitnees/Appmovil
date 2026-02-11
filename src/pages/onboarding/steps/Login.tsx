
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingContext } from "../OnboardingFlow";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { toast } from "@/hooks/use-toast";
import GatofitAILogo from "@/components/GatofitAILogo";
import useAuthForm from "@/hooks/useAuthForm";
import LoginForm from "@/components/onboarding/auth/LoginForm";
import BackButton from "@/components/onboarding/auth/BackButton";
import { usePlatform } from "@/hooks/usePlatform";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const context = useContext(OnboardingContext);
  const { saveOnboardingToProfile, checkIfUserHasCompleteProfile } = useOnboardingPersistence();
  const { isNative, isAndroid, isIOS } = usePlatform();

  const {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    loading, setLoading,
    googleLoading, setGoogleLoading,
    error, setError
  } = useAuthForm();

  const [appleLoading, setAppleLoading] = React.useState(false);

  if (!context) {
    throw new Error("Login must be used within OnboardingContext");
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa tu email y contraseña");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error, data } = await signIn(email, password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Email o contraseña incorrectos");
        } else if (error.message.includes("rate limit exceeded")) {
          setError("Has alcanzado el límite de intentos. Intenta de nuevo más tarde o utiliza Google para iniciar sesión.");
        } else {
          setError(error.message);
        }
      } else {
        // Check if user already has complete profile data
        const hasCompleteProfile = await checkIfUserHasCompleteProfile();

        console.log('User has complete profile:', hasCompleteProfile);

        // Only save onboarding data if user has incomplete profile
        // Use preserveExisting=true to avoid overwriting existing data on direct login
        if (!hasCompleteProfile) {
          console.log('Profile incomplete, saving onboarding data');
          await saveOnboardingToProfile(context.data, false, true);
        } else {
          console.log('Profile already complete, skipping onboarding data save');
        }

        toast.success({
          title: "¡Bienvenido de nuevo!",
          description: "Has iniciado sesión exitosamente"
        });
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setError("Error al iniciar sesión con Google: " + error.message);
        setGoogleLoading(false);
      } else {
        // Navigate to app-transition after successful auth
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setAppleLoading(true);

    try {
      const { error } = await signInWithApple();

      if (error) {
        setError("Error al iniciar sesión con Apple: " + error.message);
        setAppleLoading(false);
      } else {
        // Navigate to app-transition after successful auth
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Apple");
      setAppleLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/onboarding/create-account");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    toast.show({
      title: "Recuperación de contraseña",
      description: "Próximamente disponible"
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OnboardingLayout currentStep={18} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">
        Inicia sesión en <GatofitAILogo size="lg" className="inline-block" />
      </h1>

      <p className="text-muted-foreground mb-6">
        Continúa tu viaje fitness
      </p>

      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        error={error}
      />

      <div className="flex justify-end mt-2 mb-6">
        <button
          onClick={handleForgotPassword}
          className="text-xs text-primary"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4 pb-10">
        <button
          className="w-full py-6 h-auto flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-neu-button active:shadow-neu-button-active disabled:opacity-50 disabled:pointer-events-none transition-all"
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          ) : "Iniciar Sesión"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-xs text-muted-foreground">o continuar con</span>
          </div>
        </div>

        <button
          className="w-full py-6 h-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-muted rounded-xl transition-all"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* Solo mostrar botón de Apple en iOS, no en Android */}
        {!isAndroid && (
          <button
            className="w-full py-6 h-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-muted rounded-xl transition-all"
            onClick={handleAppleSignIn}
            disabled={appleLoading}
          >
            {appleLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <>
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" fill="currentColor" className="-translate-y-0.5">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
                </svg>
                <span>Continuar con Apple</span>
              </>
            )}
          </button>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta? <button onClick={handleCreateAccount} className="text-primary">Crear cuenta</button>
          </p>
        </div>

        <BackButton onBack={handleBack} />
      </div>
    </OnboardingLayout>
  );
};

export default Login;
