
import React from "react";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/hooks/usePlatform";

interface AuthButtonsProps {
  handleCreateAccount: () => void;
  handleGoogleSignUp: () => void;
  handleAppleSignUp: () => void;
  handleLogin: () => void;
  loading: boolean;
  googleLoading: boolean;
  appleLoading: boolean;
  isDisabled: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({
  handleCreateAccount,
  handleGoogleSignUp,
  handleAppleSignUp,
  handleLogin,
  loading,
  googleLoading,
  appleLoading,
  isDisabled
}) => {
  const { isAndroid, isNative, isIOS } = usePlatform();

  return (
    <div className="mt-6 w-full max-w-md mx-auto space-y-4">
      <Button
        className="w-full py-6 h-auto flex items-center justify-center space-x-2"
        onClick={handleCreateAccount}
        disabled={loading || isDisabled}
      >
        {loading ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
        ) : "Crear Mi Cuenta"}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">o continuar con</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full py-6 h-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10"
        onClick={handleGoogleSignUp}
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
      </Button>

      {/* Solo mostrar botón de Apple en iOS, no en Android */}
      {!isAndroid && (
        <Button
          variant="outline"
          className="w-full py-6 h-auto flex items-center justify-center gap-3 text-base bg-white/5 hover:bg-white/10"
          onClick={handleAppleSignUp}
          disabled={appleLoading}
        >
          {appleLoading ? (
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <>
              <svg
                className="w-5 h-5 shrink-0 -translate-y-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 814 1000"
                fill="currentColor"
              >
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57-155.5-127C46.7 790.7 0 663 0 541.8c0-194.4 126.4-297.5 250.8-297.5 66.1 0 121.2 43.4 162.7 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
              </svg>
              <span className="leading-none">Continuar con Apple</span>
            </>
          )}
        </Button>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <button onClick={handleLogin} className="text-primary">Iniciar sesión</button>
        </p>
      </div>

    </div>
  );
};

export default AuthButtons;
