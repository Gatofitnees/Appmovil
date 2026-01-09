
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingContext } from "../OnboardingFlow";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { toast } from "@/hooks/use-toast";
import GatofitAILogo from "@/components/GatofitAILogo";
import AccountForm from "@/components/onboarding/auth/AccountForm";
import AuthButtons from "@/components/onboarding/auth/AuthButtons";
import BackButton from "@/components/onboarding/auth/BackButton";
import useAuthForm from "@/hooks/useAuthForm";
import { usePlatform } from "@/hooks/usePlatform";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithApple } = useAuth();
  const context = useContext(OnboardingContext);
  const { saveOnboardingToProfile, markGoogleAuthPending, saveOnboardingData } = useOnboardingPersistence();
  const { isIOS } = usePlatform();

  const {
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    agreedToTerms, setAgreedToTerms,
    loading, setLoading,
    googleLoading, setGoogleLoading,
    error, setError
  } = useAuthForm({
    validateForm: (email, password, confirmPassword, agreedToTerms) => {
      if (!email) return "Por favor ingresa tu email";
      if (!/\S+@\S+\.\S+/.test(email)) return "Por favor ingresa un email válido";
      if (!password) return "Por favor ingresa una contraseña";
      if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
      if (password !== confirmPassword) return "Las contraseñas no coinciden";
      if (!agreedToTerms) return "Debes aceptar los términos y condiciones";
      return null;
    }
  });

  const [appleLoading, setAppleLoading] = React.useState(false);

  if (!context) {
    throw new Error("CreateAccount must be used within OnboardingContext");
  }

  const validateForm = () => {
    if (!email) return "Por favor ingresa tu email";
    if (!/\S+@\S+\.\S+/.test(email)) return "Por favor ingresa un email válido";
    if (!password) return "Por favor ingresa una contraseña";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    if (!agreedToTerms) return "Debes aceptar los términos y condiciones";
    return null;
  };

  const handleCreateAccount = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      console.log('Starting email signup with data:', context.data);

      // Save onboarding data before signup attempt
      saveOnboardingData(context.data);

      const { error, data } = await signUp(email, password);

      if (error) {
        if (error.message.includes("rate limit exceeded")) {
          setError("Has alcanzado el límite de envío de correos. Intenta de nuevo más tarde o utiliza Google para registrarte.");
        } else {
          setError(error.message);
        }
      } else {
        console.log('Email signup successful, saving onboarding data...');

        // Save onboarding data to profile after successful signup
        setTimeout(async () => {
          try {
            await saveOnboardingToProfile(context.data);
            console.log('Onboarding data saved successfully after email signup');
          } catch (saveError) {
            console.error('Error saving onboarding data after email signup:', saveError);
          }
        }, 1000);

        toast.success({
          title: "¡Cuenta creada!",
          description: "Te hemos enviado un email de verificación"
        });
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      console.error('Error during email signup:', err);
      setError(err.message || "Error creando la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      console.log('Starting Google signup with data:', context.data);

      // CRITICAL: Save onboarding data before Google Auth
      // This prevents data loss when localStorage is reset during OAuth flow
      markGoogleAuthPending(context.data);
      saveOnboardingData(context.data);

      console.log('Onboarding data saved before Google auth, initiating OAuth...');

      const { error } = await signInWithGoogle();

      if (error) {
        console.error('Google auth error:', error);
        const errorMsg = error.message || 'Error desconocido';
        setError("Error al iniciar sesión con Google: " + errorMsg);
        setGoogleLoading(false);

        // Log detailed error for debugging
        console.error('Google auth error details:', {
          message: error.message,
          code: (error as any).code,
          status: (error as any).status,
          name: (error as any).name,
        });
      } else {
        // Success - navigate to app transition screen
        console.log('Google auth successful, navigating to app transition...');
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      console.error('Unexpected error during Google auth:', err);
      setError(err.message || "Error al iniciar sesión con Google");
      setGoogleLoading(false);
    }
  };

  const handleAppleSignUp = async () => {
    setError(null);
    setAppleLoading(true);

    try {
      console.log('Starting Apple signup with data:', context.data);

      // Save onboarding data before Apple Auth
      markGoogleAuthPending(context.data);
      saveOnboardingData(context.data);

      console.log('Onboarding data saved before Apple auth, initiating OAuth...');

      const { error } = await signInWithApple();

      if (error) {
        console.error('Apple auth error:', error);
        const errorMsg = error.message || 'Error desconocido';
        setError("Error al iniciar sesión con Apple: " + errorMsg);
        setAppleLoading(false);

        // Log detailed error for debugging
        console.error('Apple auth error details:', {
          message: error.message,
          code: (error as any).code,
          status: (error as any).status,
          name: (error as any).name,
        });
      } else {
        // Success - navigate to app transition screen
        console.log('Apple auth successful, navigating to app transition...');
        navigate("/onboarding/app-transition");
      }
    } catch (err: any) {
      console.error('Unexpected error during Apple auth:', err);
      setError(err.message || "Error al iniciar sesión con Apple");
      setAppleLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/onboarding/login");
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OnboardingLayout currentStep={18} totalSteps={20}>
      <h1 className="text-2xl font-bold mb-2">
        Crea tu Cuenta <GatofitAILogo size="lg" className="inline-block" />
      </h1>

      <p className="text-muted-foreground mb-6">
        Un paso más para comenzar tu viaje fitness
      </p>

      <AccountForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        agreedToTerms={agreedToTerms}
        setAgreedToTerms={setAgreedToTerms}
        loading={loading}
        error={error}
        showConfirmPassword={true}
        showTermsAgreement={true}
      />

      <AuthButtons
        handleCreateAccount={handleCreateAccount}
        handleGoogleSignUp={handleGoogleSignUp}
        handleAppleSignUp={handleAppleSignUp}
        handleLogin={handleLogin}
        loading={loading}
        googleLoading={googleLoading}
        appleLoading={appleLoading}
        isDisabled={!email || !password || !confirmPassword || !agreedToTerms}
      />

      <div className="pb-10">
        <BackButton onBack={handleBack} />
      </div>
    </OnboardingLayout>
  );
};

export default CreateAccount;
