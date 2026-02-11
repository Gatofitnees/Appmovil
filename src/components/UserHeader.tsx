
import React, { useState } from "react";
import { usePlatform } from "@/hooks/usePlatform";
import Avatar from "./Avatar";
import RankBadge from "./RankBadge";
import ExperienceBar from "./ExperienceBar";
import AIChat from "./AIChat";
import { Settings, LogOut, Globe, CreditCard, RefreshCw, User, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileContext } from "@/contexts/ProfileContext";
import { useStreaks } from "@/hooks/useStreaks";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getExperienceProgress } from "@/utils/rankSystem";
import { useNavigate, useLocation } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";
import { useEffect } from "react";
import { PremiumModal } from './premium/PremiumModal';

interface UserHeaderProps {
  username?: string;
  progress?: number;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  progress = 75
}) => {
  const { isIOS } = usePlatform();
  const [showMenu, setShowMenu] = useState(false);
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfileContext();
  const { streakData, refetch: refetchStreak } = useStreaks();
  const { isPremium, isAsesorado } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showXPParticles, setShowXPParticles] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Handle XP Animation and Deferred Streak Update from Workout Summary
  useEffect(() => {
    if (location.state?.animateXP && location.state?.shouldRefetchStreak) {
      console.log("Triggering XP Animation sequence...");
      setShowXPParticles(true);

      // Sequence:
      // 1. Show Animation (1.5s)
      // 2. Refetch Streak (Trigger Modal)
      // 3. Cleanup
      const timer = setTimeout(async () => {
        setShowXPParticles(false);

        // Clear state to prevent loop
        window.history.replaceState({}, document.title);

        console.log("Animation done. Refetching streak now...");
        await refetchStreak();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location.state, refetchStreak]);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
    navigate('/onboarding/welcome', { replace: true });
  };

  const handleProfileClick = () => {
    setShowMenu(false);
    navigate('/profile');
  };

  const handleManageSubscription = () => {
    setShowMenu(false);
    setShowPremiumModal(true);
  };

  const handleChangeAccount = async () => {
    try {
      await signOut();
      // Redirect to login with account selector
      navigate('/onboarding/login', { replace: true });
    } catch (error) {
      console.error('Error changing account:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar de cuenta",
        variant: "destructive"
      });
    }
    setShowMenu(false);
  };

  const handleSupport = () => {
    setShowMenu(false);
    navigate('/support');
  };

  // Get experience progress
  const experienceProgress = streakData ? getExperienceProgress(streakData.total_experience) : null;
  const currentLevel = streakData?.current_level || 1;

  // ONLY use profile data - never fallback to user metadata
  const displayName = profileLoading ? "" : (profile?.full_name || profile?.username || "Usuario");
  const avatarUrl = profileLoading ? "" : profile?.avatar_url;

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className={`flex items-center justify-between${isIOS ? ' mt-2 mb-4' : ''}`} style={{ marginTop: isIOS ? undefined : 0, marginBottom: isIOS ? undefined : 0 }}>
        <div className="flex items-center">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="ml-4">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
        <AIChat />
      </div>
    );
  }
  return (
    <div className="relative">
      <div className={`flex items-center justify-between${isIOS ? ' mt-2 mb-4' : ''}`} style={{ marginTop: isIOS ? undefined : 0, marginBottom: isIOS ? undefined : 0 }}>
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Avatar
            name={displayName}
            progress={experienceProgress?.progress || progress}
            size="md"
            src={avatarUrl}
            isPremium={isPremium}
            isAsesorado={isAsesorado}
          />
          <div className="ml-4">
            <h1 className="text-xl font-bold">
              ¡Hola, <span className="text-gradient">{displayName}</span>!
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Nivel {currentLevel}</span>
              <span className="text-muted-foreground">•</span>
              <RankBadge level={currentLevel} size="sm" showIcon={false} />

              {/* Streak Freeze Shield */}

            </div>
            {experienceProgress && (
              <ExperienceBar
                totalExperience={streakData?.total_experience || 0}
                className="mt-2 w-32"
              />
            )}
          </div>
        </div>

        <AIChat />
      </div>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 p-4 neu-card rounded-xl animate-fade-in">
          <div className="mb-4 pb-2 border-b border-muted/30">
            <div className="flex items-center">
              <Avatar
                name={displayName}
                progress={experienceProgress?.progress || progress}
                size="sm"
                src={avatarUrl}
                isPremium={isPremium}
                isAsesorado={isAsesorado}
              />
              <div className="ml-2">
                <p className="font-medium text-sm">{displayName}</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">Nivel {currentLevel}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <RankBadge level={currentLevel} size="sm" showIcon={false} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="text-sm font-medium">{profile?.current_weight_kg || '--'} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Altura</p>
                <p className="text-sm font-medium">{profile?.height_cm || '--'} cm</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">% Graso</p>
                <p className="text-sm font-medium">{profile?.body_fat_percentage || '--'}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={handleProfileClick}
            >
              <User className="h-4 w-4 mr-2" />
              Ver perfil
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={() => toast({
                title: "Cambiar idioma",
                description: "Función próximamente disponible",
              })}
            >
              <Globe className="h-4 w-4 mr-2" />
              Cambiar idioma
            </Button>

            {!isAsesorado && (
              <Button
                variant="secondary"
                size="sm"
                className="justify-start"
                onClick={handleManageSubscription}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Gestionar plan de pago
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={handleSupport}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Soporte
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="justify-start"
              onClick={handleChangeAccount}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Cambiar cuenta
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="justify-start text-red-400 hover:bg-red-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}
      {/* XP Animation Particles */}
      {showXPParticles && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
          <div className="relative">
            <div className="absolute text-5xl animate-ping opacity-75">⚡</div>
            <div className="text-5xl animate-bounce text-yellow-400 font-black drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
              +25 XP
            </div>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

export default UserHeader;
