import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle Android hardware back button.
 * Instead of closing the app, it navigates back in the browser history.
 * Only closes the app when on the home page or at the start of navigation history.
 */
export const useAndroidBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run on native platforms (Android)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleBackButton = App.addListener('backButton', ({ canGoBack }) => {
      // Define routes where back button should exit the app
      const exitRoutes = ['/home', '/', '/onboarding/welcome'];
      const isExitRoute = exitRoutes.includes(location.pathname);

      if (canGoBack && !isExitRoute) {
        // Navigate back in history
        navigate(-1);
      } else if (isExitRoute) {
        // Exit the app when on home or welcome page
        App.exitApp();
      } else {
        // If we can't go back and not on exit route, go to home
        navigate('/home');
      }
    });

    // Cleanup listener on unmount
    return () => {
      handleBackButton.remove();
    };
  }, [navigate, location.pathname]);
};

export default useAndroidBackButton;
