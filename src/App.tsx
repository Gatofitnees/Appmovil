import React, { useState, useEffect } from 'react';
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MainTabsLayout from "./layouts/MainTabsLayout";
import WorkoutPage from "./pages/WorkoutPage";
import NutritionPage from "./pages/NutritionPage";
import RankingPage from "./pages/RankingPage";
import SocialPage from "./pages/SocialPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import BodyMeasurementsPage from "./pages/BodyMeasurementsPage";
import UserInformationPage from "./pages/UserInformationPage";
import ProgressPage from "./pages/ProgressPage";
import CalendarPage from "./pages/CalendarPage";
import FoodSearchPage from "./pages/FoodSearchPage";
import SettingsPage from "./pages/SettingsPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import AIChatPage from "./pages/AIChatPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SupportPage from "./pages/SupportPage";
import WeeklyProgramsPage from "./pages/WeeklyProgramsPage";
import CreateWeeklyProgramPage from "./pages/CreateWeeklyProgramPage";
import ViewWeeklyProgramPage from "./pages/ViewWeeklyProgramPage";
import EditWeeklyProgramPage from "./pages/EditWeeklyProgramPage";
import GatofitProgramsPage from "./pages/GatofitProgramsPage";
import GatofitProgramDetailPage from "./pages/GatofitProgramDetailPage";
import CoachChatPage from "./pages/CoachChatPage";
import NavBar from "./components/NavBar";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import AuthProvider from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectExercisesPage from "./pages/SelectExercisesPage";
import ExerciseDetailsPage from "./pages/ExerciseDetailsPage";
import CreateExercisePage from "./pages/CreateExercisePage";
import CreateRoutinePage from "./pages/CreateRoutinePage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import WorkoutSummaryPage from "./pages/WorkoutSummaryPage";
import { FoodEditPage } from "./pages/FoodEditPage";
import { ProgressiveNutritionProgramPage } from "./pages/ProgressiveNutritionProgramPage";
import RoutineDetailPage from "./pages/RoutineDetailPage";
import { RoutineProvider } from "./features/workout/contexts/RoutineContext";
import { WorkoutCacheProvider, useWorkoutCacheContext } from "./features/workout/contexts/WorkoutCacheContext";
import { WorkoutRecoveryDialog } from "./features/workout/components/active-workout/WorkoutRecoveryDialog";
import { PaymentFailureAlert } from "./components/subscription/PaymentFailureAlert";
import { PaymentFailurePopup } from "./components/subscription/PaymentFailurePopup";
import { supabase } from "@/integrations/supabase/client";
import { optimizeForMobile } from '@/utils/mobileOptimizations';
import { useBranding } from "./contexts/BrandingContext";
import { useDynamicBranding } from "./hooks/useDynamicBranding";
import { useSwipeBack } from "./hooks/useSwipeBack";
import { useDailyNotifications } from "./hooks/useDailyNotifications";
import { useAndroidBackButton } from "./hooks/useAndroidBackButton";
import { useLocation } from 'react-router-dom';
import SafeAreaBars from "./components/SafeAreaBars";
import { PurchaseSuccessGlobal } from "./components/subscription/PurchaseSuccessGlobal";
import { StreakListener } from "./components/streak/StreakListener";
import { StreakProvider } from "./contexts/StreakContext";

// Component to setup daily notifications
const DailyNotificationsSetup: React.FC = () => {
  useDailyNotifications();
  return null;
};

// Component to update document title based on branding
const DocumentTitleUpdater: React.FC = () => {
  const { branding } = useBranding();

  useEffect(() => {
    document.title = branding.companyName;
  }, [branding.companyName]);

  return null;
};

// Component to apply dynamic branding
const DynamicBrandingApplier: React.FC = () => {
  useDynamicBranding();
  return null;
};

// Component to handle swipe back gesture
const SwipeBackHandler: React.FC = () => {
  useSwipeBack();
  return null;
};

// Component to handle Android hardware back button
const AndroidBackButtonHandler: React.FC = () => {
  useAndroidBackButton();
  return null;
};

// Component to handle workout recovery on app start
const WorkoutRecoveryHandler: React.FC = () => {
  const navigate = useNavigate();
  const { cachedWorkout, clearCache, checkCache } = useWorkoutCacheContext();
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  useEffect(() => {
    // Check for cached workout on mount only once
    const cache = checkCache();
    if (cache) {
      setShowRecoveryDialog(true);
    }
  }, []); // Empty deps - only run once on mount

  const handleContinue = () => {
    if (cachedWorkout) {
      setShowRecoveryDialog(false);
      navigate(`/workout/active/${cachedWorkout.routineId}`, {
        state: { fromCache: true }
      });
    }
  };

  const handleDiscard = () => {
    clearCache();
    setShowRecoveryDialog(false);
  };

  return (
    <WorkoutRecoveryDialog
      open={showRecoveryDialog}
      cacheData={cachedWorkout}
      onContinue={handleContinue}
      onDiscard={handleDiscard}
    />
  );
};

// Global payment failure banner component
const GlobalPaymentFailureBanner: React.FC = () => {
  const [paymentFailure, setPaymentFailure] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subData && (subData.status as string) === 'payment_failed') {
        setSubscription(subData);

        // Get payment failure info
        const { data: failureData } = await supabase
          .from('subscription_payment_failures')
          .select('*')
          .eq('user_id', user.id)
          .is('resolved_at', null)
          .order('failed_at', { ascending: false })
          .limit(1)
          .single();

        if (failureData) {
          setPaymentFailure(failureData);
        }
      } else {
        setPaymentFailure(null);
        setSubscription(null);
      }
    };

    checkPaymentStatus();
  }, []);

  if (!paymentFailure || !subscription) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <PaymentFailureAlert
        gracePeriodEndsAt={paymentFailure.grace_period_ends_at}
        compact={true}
      />
    </div>
  );
};

// Payment failure popup handler (shows once per session at app entry)
const PaymentFailurePopupHandler: React.FC = () => {
  const location = useLocation();
  const [paymentFailure, setPaymentFailure] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Don't show popup if already on subscription page
      if (location.pathname === '/subscription') {
        return;
      }

      // Check if popup was already shown this session
      const POPUP_SHOWN_KEY = 'payment_failure_popup_shown';
      const hasShownPopup = sessionStorage.getItem(POPUP_SHOWN_KEY);

      if (hasShownPopup) {
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get subscription
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subData && (subData.status as string) === 'payment_failed') {
        // Get payment failure info
        const { data: failureData } = await supabase
          .from('subscription_payment_failures')
          .select('*')
          .eq('user_id', user.id)
          .is('resolved_at', null)
          .order('failed_at', { ascending: false })
          .limit(1)
          .single();

        if (failureData) {
          setPaymentFailure(failureData);
          setShowPopup(true);
          sessionStorage.setItem(POPUP_SHOWN_KEY, 'true');
        }
      }
    };

    checkPaymentStatus();
  }, [location.pathname]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  if (!paymentFailure || !showPopup) return null;

  return (
    <PaymentFailurePopup
      gracePeriodEndsAt={paymentFailure.grace_period_ends_at}
      isOpen={showPopup}
      onClose={handleClosePopup}
    />
  );
};

// Wrapper for global layout styles that need router context
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname === '/ai-chat' || location.pathname === '/coach-chat';
  /* 
    Updated logic: For pages with translucent/blurred SafeAreaBars, we remove the container padding 
    so the content flows BEHIND the bar (starting at top: 0). 
    This allows the backdrop-blur to actually blur the content behind it.
  */
  const blurredRoutes = ['/home', '/workout', '/nutrition', '/ranking', '/social'];
  // Check if current path matches EXACTLY one of the blurred routes.
  // We do NOT want sub-routes (like /workout/active) to be blurred/unpadded.
  const isBlurredPage = blurredRoutes.includes(location.pathname);

  return (
    <div className="bg-background text-foreground" style={{
      minHeight: '100vh',
      // For chat or blurred pages, top padding is handled by the page content or we want overlap for blur
      paddingTop: (isChatPage || isBlurredPage) ? '0px' : 'max(var(--safe-area-inset-top), 50px)',
      paddingBottom: 'var(--safe-area-inset-bottom)'
    }}>
      {children}
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize mobile optimizations
    optimizeForMobile();
  }, []);

  return (

    <AuthProvider>
      <SubscriptionProvider>
        <ProfileProvider>
          <BrandingProvider>
            <DocumentTitleUpdater />
            <DynamicBrandingApplier />
            <DailyNotificationsSetup />
            <WorkoutCacheProvider>
              <Router>
                <SwipeBackHandler />
                <AndroidBackButtonHandler />
                <WorkoutRecoveryHandler />
                <PaymentFailurePopupHandler />
                <GlobalPaymentFailureBanner />
                <PurchaseSuccessGlobal />
                {/* Safe area bars for notch and home indicator */}
                <SafeAreaBars />
                <StreakProvider>
                  <StreakListener />
                  <LayoutWrapper>

                    <RoutineProvider>
                      <Routes>
                        <Route path="/onboarding/*" element={<OnboardingFlow />} />
                        <Route
                          path="/"
                          element={
                            <ProtectedRoute>
                              <Navigate to="/home" replace />
                            </ProtectedRoute>
                          }
                        />

                        {/* Persistent Tabs Layout */}
                        <Route element={<ProtectedRoute><MainTabsLayout /></ProtectedRoute>}>
                          <Route path="/home" element={<div />} />
                          <Route path="/workout" element={<div />} />
                          <Route path="/nutrition" element={<div />} />
                          <Route path="/ranking" element={<div />} />
                          <Route path="/social" element={<div />} />
                        </Route>

                        <Route
                          path="/ai-chat"
                          element={
                            <ProtectedRoute>
                              <AIChatPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/coach-chat"
                          element={
                            <ProtectedRoute>
                              <CoachChatPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/subscription"
                          element={
                            <ProtectedRoute>
                              <SubscriptionPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/support"
                          element={
                            <ProtectedRoute>
                              <SupportPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile/body-measurements"
                          element={
                            <ProtectedRoute>
                              <BodyMeasurementsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile/user-information"
                          element={
                            <ProtectedRoute>
                              <UserInformationPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile/progress"
                          element={
                            <ProtectedRoute>
                              <ProgressPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile/calendar"
                          element={
                            <ProtectedRoute>
                              <CalendarPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <SettingsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/public-profile/:userId"
                          element={
                            <ProtectedRoute>
                              <PublicProfilePage />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/workout/programs"
                          element={
                            <ProtectedRoute>
                              <WeeklyProgramsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/programs/create"
                          element={
                            <ProtectedRoute>
                              <CreateWeeklyProgramPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/programs/view/:programId"
                          element={
                            <ProtectedRoute>
                              <ViewWeeklyProgramPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/programs/edit/:programId"
                          element={
                            <ProtectedRoute>
                              <EditWeeklyProgramPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/gatofit-programs"
                          element={
                            <ProtectedRoute>
                              <GatofitProgramsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/gatofit-programs/:programId"
                          element={
                            <ProtectedRoute>
                              <GatofitProgramDetailPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/create"
                          element={
                            <ProtectedRoute>
                              <CreateRoutinePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/edit/:routineId"
                          element={
                            <ProtectedRoute>
                              <CreateRoutinePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/active/:routineId"
                          element={
                            <ProtectedRoute>
                              <ActiveWorkoutPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/summary/:workoutId"
                          element={
                            <ProtectedRoute>
                              <WorkoutSummaryPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/select-exercises"
                          element={
                            <ProtectedRoute>
                              <SelectExercisesPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/exercise-details/:id"
                          element={
                            <ProtectedRoute>
                              <ExerciseDetailsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/workout/create-exercise"
                          element={
                            <ProtectedRoute>
                              <CreateExercisePage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/routine/:routineId"
                          element={
                            <ProtectedRoute>
                              <RoutineDetailPage />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/nutrition/search"
                          element={
                            <ProtectedRoute>
                              <FoodSearchPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/food-edit"
                          element={
                            <ProtectedRoute>
                              <FoodEditPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/nutrition-program"
                          element={
                            <ProtectedRoute>
                              <ProgressiveNutritionProgramPage />
                            </ProtectedRoute>
                          }
                        />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </RoutineProvider>
                  </LayoutWrapper>
                </StreakProvider>
              </Router>
            </WorkoutCacheProvider>
          </BrandingProvider>
        </ProfileProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;