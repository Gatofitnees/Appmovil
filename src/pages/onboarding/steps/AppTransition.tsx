
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useOnboardingPersistence } from "@/hooks/useOnboardingPersistence";
import { useToast } from "@/hooks/use-toast";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";

const AppTransition: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { refreshProfile } = useProfileContext();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentStatus, setCurrentStatus] = useState("Configurando tu cuenta...");
  const hasRedirectedRef = useRef(false);
  const hasProcessedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    handleGoogleAuthData,
    saveOnboardingToProfile,
    loadOnboardingData,
    clearOnboardingData
  } = useOnboardingPersistence();

  // Absolute timeout to prevent infinite waiting
  const redirectToHome = () => {
    if (!hasRedirectedRef.current) {
      console.log('AppTransition: Redirecting to home (timeout or success)');
      hasRedirectedRef.current = true;
      setIsProcessing(false);
      navigate("/home", { replace: true });
    }
  };

  useEffect(() => {
    const processTransition = async () => {
      // Prevent multiple executions for the same user
      if (hasRedirectedRef.current || hasProcessedRef.current) {
        return;
      }

      // If user changed, reset processing state
      if (user?.id && userIdRef.current && userIdRef.current !== user.id) {
        hasProcessedRef.current = false;
        hasRedirectedRef.current = false;
      }

      console.log('AppTransition: Starting transition process');
      setIsProcessing(true);

      // Wait for auth to complete if still loading
      if (authLoading) {
        console.log('AppTransition: Waiting for auth to complete...');
        setCurrentStatus("Verificando autenticación...");
        return;
      }

      // If no user, redirect to welcome
      if (!user) {
        console.log('AppTransition: No user found, redirecting to welcome');
        hasRedirectedRef.current = true;
        navigate("/onboarding/welcome", { replace: true });
        return;
      }

      // Mark this user as being processed
      userIdRef.current = user.id;
      hasProcessedRef.current = true;

      console.log('AppTransition: User authenticated:', user.id);
      setCurrentStatus("Guardando tus datos...");

      // Set absolute timeout of 15 seconds - after this, redirect regardless
      timeoutRef.current = setTimeout(() => {
        console.log('AppTransition: 15-second timeout reached, redirecting to home');
        redirectToHome();
      }, 15000);

      let saveSuccess = false;

      try {
        // First, try to handle Google auth data if it exists
        console.log('AppTransition: Checking for Google auth data...');
        const googleAuthResult = await handleGoogleAuthData();

        if (googleAuthResult) {
          console.log('AppTransition: Google auth data processed successfully');
          saveSuccess = true;
        } else {
          console.log('AppTransition: No Google auth data or processing failed, trying regular onboarding data...');

          // If no Google auth data, try regular onboarding data
          const onboardingData = loadOnboardingData();

          if (onboardingData) {
            console.log('AppTransition: Found regular onboarding data, attempting to save...');
            saveSuccess = await saveOnboardingToProfile(onboardingData);

            if (saveSuccess) {
              console.log('AppTransition: Regular onboarding data saved successfully');
            } else {
              console.log('AppTransition: Failed to save regular onboarding data');
            }
          } else {
            console.log('AppTransition: No onboarding data found');
            // If no data to save, consider it successful to avoid blocking the user
            saveSuccess = true;
          }
        }

        // Show appropriate messages and redirect
        if (saveSuccess) {
          setCurrentStatus("¡Configuración completada!");
          // Only show toast if there's actual onboarding data saved
          const onboardingData = loadOnboardingData();
          if (onboardingData && Object.keys(onboardingData).length > 0) {
            toast({
              title: "¡Bienvenido a Gatofit!",
              description: "Tu perfil ha sido configurado exitosamente",
            });
          }

          // Refresh profile to load the newly saved data
          console.log('AppTransition: Refreshing profile to load saved data...');
          refreshProfile();
        } else {
          console.error('AppTransition: Failed to save onboarding data');
          setCurrentStatus("Finalizando configuración...");
          // Only show error toast if there was actually data to save
          const onboardingData = loadOnboardingData();
          if (onboardingData && Object.keys(onboardingData).length > 0) {
            toast({
              title: "Configuración parcial",
              description: "Algunos datos no se pudieron guardar, pero puedes completarlos desde tu perfil",
              variant: "default"
            });
          }
        }

        // Clear the timeout since we're redirecting successfully
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Wait longer before redirecting to ensure profile refresh completes
        console.log('AppTransition: Waiting for profile refresh to complete...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!hasRedirectedRef.current) {
          console.log('AppTransition: Redirecting to home (successful)');
          redirectToHome();
        }

      } catch (error) {
        console.error('AppTransition: Error during transition process:', error);
        setCurrentStatus("Finalizando...");

        // Only show toast for actual errors
        toast({
          title: "Proceso completado",
          description: "Puedes completar tu configuración desde el perfil si es necesario",
          variant: "default"
        });

        // Clear the timeout since we're redirecting on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Don't block the user, redirect anyway after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!hasRedirectedRef.current) {
          redirectToHome();
        }
      } finally {
        setIsProcessing(false);
      }
    };

    // Only run when user changes or auth stops loading
    if (!authLoading) {
      processTransition();
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user?.id, authLoading]); // Simplified dependencies

  return (
    <OnboardingLayout currentStep={20} totalSteps={20}>
      <div className="flex flex-col items-center justify-center space-y-6 text-center min-h-[400px]">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">¡Ya casi estamos listos!</h1>
          <p className="text-muted-foreground">{currentStatus}</p>
        </div>

        {isProcessing && (
          <div className="max-w-md text-sm text-muted-foreground space-y-2">
            <p>• Configurando tu perfil personalizado</p>
            <p>• Calculando tus recomendaciones nutricionales</p>
            <p>• Preparando tu experiencia fitness</p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default AppTransition;
