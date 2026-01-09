
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Button from '@/components/Button';
import { Crown, Check, X, Sparkles, Star, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'routines' | 'nutrition' | 'ai_chat' | 'gatofit_programs';
  currentUsage?: number;
  limit?: number;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  feature,
  currentUsage,
  limit
}) => {
  const { plans } = useSubscription();
  const navigate = useNavigate();

  const getFeatureMessage = () => {
    switch (feature) {
      case 'routines':
        return {
          title: 'Límite alcanzado',
          description: `Has creado ${currentUsage}/${limit} rutinas. Actualiza a Premium para crear rutinas ilimitadas.`
        };
      case 'nutrition':
        return {
          title: 'Límite alcanzado',
          description: `Has usado ${currentUsage}/${limit} fotos esta semana. Actualiza a Premium para fotos ilimitadas.`
        };
      case 'ai_chat':
        return {
          title: 'Límite alcanzado',
          description: `Has usado ${currentUsage}/${limit} chats esta semana. Actualiza a Premium para chats ilimitados.`
        };
      case 'gatofit_programs':
        return {
          title: 'Desbloquea Programas Gatofit',
          description: 'Accede a todos los programas profesionales de entrenamiento creados por Gatofit al ser usuario Premium.'
        };
      default:
        return {
          title: 'Desbloquea Premium',
          description: 'Accede a todas las funciones premium sin limitaciones.'
        };
    }
  };

  const featureInfo = getFeatureMessage();
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-border max-w-sm mx-auto rounded-2xl p-0 overflow-visible shadow-neu-card animate-scale-in">
        {/* Header */}
        <DialogHeader className="relative flex flex-row items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {featureInfo.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="relative px-6 pb-6 space-y-6">
          {/* Description */}
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            {featureInfo.description}
          </p>

          {/* Price Card with Badge */}
          {yearlyPlan && (
            <div className="relative pt-4">
              {/* Floating badge - positioned above with proper spacing */}
              <div className="flex justify-center mb-2">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-neu-button animate-pulse">
                  <Star className="inline h-3 w-3 mr-1" />
                  AHORRA 61%
                </div>
              </div>

              {/* Price Card */}
              <div className="relative bg-secondary/70 rounded-2xl p-6 border border-border shadow-neu-button">
                <div className="text-center">
                  <div className="mb-2">
                    <span className="text-sm text-muted-foreground line-through">${yearlyPlan.price_usd}/año</span>
                  </div>

                  {/* Main price */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-5xl font-black text-primary animate-pulse">
                      $3.33
                    </span>
                    <div className="text-lg text-muted-foreground font-medium">
                      /mes
                    </div>
                  </div>

                  <p className="text-sm text-primary font-semibold">
                    Solo pagando anualmente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform duration-200">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-neu-button">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground">Rutinas ilimitadas</p>
                <p className="text-xs text-muted-foreground">Sin restricciones de creación</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform duration-200 delay-75">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-neu-button">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground">Análisis nutricional IA</p>
                <p className="text-xs text-muted-foreground">Escaneos ilimitados semanales</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm group hover:scale-105 transition-transform duration-200 delay-150">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 shadow-neu-button">
                <Star className="h-5 w-5 text-primary fill-current" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground">Chat IA ilimitado</p>
                <p className="text-xs text-muted-foreground">Asesoría personalizada 24/7</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="h-3 w-3 text-primary" />
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleUpgrade}
            variant="primary"
            size="lg"
            fullWidth
            className="shadow-neu-button hover:shadow-neu-button-active transform transition-all duration-200 hover:scale-105"
          >
            <Crown className="h-5 w-5 mr-2" />
            Desbloquear Premium
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Cancela en cualquier momento • Sin compromisos
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
