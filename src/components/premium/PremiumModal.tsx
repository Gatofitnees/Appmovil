import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Check, Lock, Sparkles, Zap, Star, TrendingUp, Users } from 'lucide-react';
import Button from '@/components/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePromoCodePricing } from '@/hooks/useRevenueCatSubscription';
import { useInAppPurchase } from '@/hooks/subscription/useInAppPurchase';
import { useSubscription } from '@/hooks/useSubscription';
import { PromoCodeInput } from '@/components/subscription/PromoCodeInput';
import gatoFlexionesVideo from '@/assets/lottie/gato flexiones.mp4';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

// Removed Wreath SVGs per user request

const TESTIMONIALS = [
  {
    name: 'Amanda',
    flag: '🇲🇽',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    progress: '90 kg → 83 kg en 2 meses',
    text: '"He bajado 7 kg y en ningún momento sentí que estaba \'a dieta\'. Me encanta la interfaz y cómo me da consejos inteligentes sin abrumar."'
  },
  {
    name: 'Carlos',
    flag: '🇨🇴',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    progress: '65 kg → 69 kg en 3 meses',
    text: '"Gatofit me ayudó a ganar 4 kg de masa muscular. Las rutinas son excelentes, súper claras y es muy fácil registrar mi progreso."'
  },
  {
    name: 'Camila',
    flag: '🇦🇷',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    progress: 'Logró constancia',
    text: '"Es la primera vez que logro mantener la constancia en el gimnasio. Los programas guiados me quitaron la ansiedad de no saber qué hacer."'
  }
];

const TestimonialCarousel = () => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((c) => c + 1);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const n = TESTIMONIALS.length;
  const period = 2 * n - 2;
  const c = counter % period;
  const index = c < n ? c : period - c;

  return (
    <div className="w-full relative overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm min-h-[210px]">
      <div
        className="flex transition-transform duration-700 ease-in-out h-full absolute inset-0"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="w-full h-full shrink-0 p-5 lg:p-6"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                <div>
                  <div className="font-bold text-gray-900 flex items-center gap-2 text-base">
                    {t.name} <span className="text-sm">{t.flag}</span>
                  </div>
                  <div className="text-[13px] font-semibold text-gray-400">
                    {t.progress}
                  </div>
                </div>
              </div>
              <p className="text-gray-800 text-[15px] font-medium leading-snug">
                {t.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
        {TESTIMONIALS.map((_, i) => (
          <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === index ? "w-4 bg-gray-800" : "w-1.5 bg-gray-200")} />
        ))}
      </div>
    </div>
  );
};

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: 'routines' | 'nutrition' | 'ai_chat' | 'ai_routine_creator' | 'gatofit_programs';
}

const FEATURES_COMPARISON = [
  {
    name: 'Rutinas ilimitadas',
    description: 'Sin restricciones de creación',
    free: false,
    premium: true,
    icon: Zap
  },
  {
    name: 'Análisis nutricional IA',
    description: 'Escaneos ilimitados semanales',
    free: '10 créditos de prueba',
    premium: true,
    icon: Sparkles
  },
  {
    name: 'Chat IA ilimitado',
    description: 'Asesoría personalizada 24/7',
    free: false,
    premium: true,
    icon: Star
  },
  {
    name: 'Creador de rutinas IA',
    description: 'Rutinas personalizadas con IA',
    free: false,
    premium: true,
    icon: TrendingUp
  },
  {
    name: 'Programas Gatofit',
    description: 'Acceso a todos los programas',
    free: false,
    premium: true,
    icon: Crown
  },
  {
    name: 'Estadísticas avanzadas',
    description: 'Análisis detallado de progreso',
    free: false,
    premium: true,
    icon: TrendingUp
  }
];

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  feature
}) => {
  const navigate = useNavigate();
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { purchaseProduct, restorePurchases, isLoading: isPurchasing } = useInAppPurchase();
  const { isPremium, subscription } = useSubscription();
  const { toast } = useToast();

  // Get promo code pricing
  const { hasPromoCode, promoCode, yearlyPrice, isLoading: isPricingLoading, reloadPricing } = usePromoCodePricing();

  // Determine specific active plan
  const isYearlyActive = subscription?.status === 'active' && subscription?.plan_type === 'yearly';
  const isMonthlyActive = subscription?.status === 'active' && subscription?.plan_type === 'monthly';
  const isCurrentPlanActive = subscription?.status === 'active' && subscription?.plan_type === selectedPlan;

  // Calculate monthly price from yearly price
  const getMonthlyPrice = () => {
    // Fixed prices for better presentation
    return hasPromoCode ? '$2.99' : '$3.99';
  };

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Play video when modal opens
      if (videoRef.current) {
        videoRef.current.play().catch(err => console.log('Video autoplay failed:', err));
      }

      // Listen for purchase success to close modal
      const handlePurchaseSuccess = () => {
        console.log('Purchase successful, closing modal');
        onClose();
      };

      window.addEventListener('iap:purchase-success', handlePurchaseSuccess);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('iap:purchase-success', handlePurchaseSuccess);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  const getFeatureDescription = () => {
    switch (feature) {
      case 'ai_chat':
        return 'Obtén asesoría personalizada 24/7 con nuestro asistente de IA';
      case 'ai_routine_creator':
        return 'Crea rutinas personalizadas con inteligencia artificial';
      case 'gatofit_programs':
        return 'Accede a programas de entrenamiento profesionales';
      case 'nutrition':
        return 'Escanea alimentos ilimitadamente con IA';
      case 'routines':
        return 'Crea todas las rutinas que necesites';
      default:
        return 'Esta función está disponible solo para usuarios Premium';
    }
  };

  const handleUpgrade = async () => {
    console.log('🔴 handleUpgrade CALLED - Button clicked!');
    // toast({ description: "🔄 Iniciando proceso de compra..." });

    try {
      // Use same logic as InAppPurchaseButton (which works!)
      const platform = Capacitor.getPlatform();
      const productId = (() => {
        if (platform === 'android') {
          // Android: USE CORRECT IDs that match InAppPurchaseButton
          return selectedPlan === 'yearly' ? 'gatofit_premium:yearly' : 'gatofit_premium:monthly';
        }
        // iOS: Use Apple's product IDs
        return selectedPlan === 'yearly' ? 'SUSCRIPCION_ANUAL' : 'SUSCRIPCION_MENSUAL';
      })();

      // Android: Try to force the specific offer ID if promo code matches
      // Android: Force specific offer ID
      let targetOfferId: string | undefined;
      let finalProductId = productId; // Default to selected plan

      if (selectedPlan === 'yearly') {
        if (platform === 'android') {
          // Android: Always be specific!
          // If hasPromoCode -> 'yearly-promo-35' ($35)
          // If NO promoCode -> 'yearly-intro-45' ($45)
          // If we leave it undefined, Google Play auto-selects the cheapest offer ($35) which is WRONG for non-promo users.
          targetOfferId = hasPromoCode ? 'yearly-promo-35' : 'yearly-intro-45';
        } else if (platform === 'ios') {
          // iOS Strategy: Product Swap
          // We do NOT use targetOfferId because we want a Standard Purchase of a specific product.
          // The App Store automatically applies the Introductory Offer (Pay Up Front) configured for that product.

          if (hasPromoCode) {
            console.log('🔄 Swapping to $35 Promo Product for iOS');
            finalProductId = 'influencer_35';
          }

          // Ensure targetOfferId is undefined so we don't trigger "Promotional Offer" signing logic
          targetOfferId = undefined;
        }
      }

      console.log('🛒 Initiating purchase:', {
        productId: finalProductId,
        targetOfferId,
        selectedPlan,
        platform,
        hasPromoCode,
        isPremium,
        yearlyPrice
      });

      // Initiate native in-app purchase
      // The modal will stay open while the native purchase flow happens
      // BUG FIX: Must use finalProductId (which might be the swapped 'influencer_35')
      await purchaseProduct(finalProductId, targetOfferId);

      // Modal will be closed by the purchase success handler in useInAppPurchase
      // Don't close here - let the native flow complete
    } catch (error) {
      console.error('❌ Purchase error:', error);
      // Error handling is done in the hook with toast
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Backdrop with animation */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-[9998]",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Modal Container - Above everything including navigation */}
      <div
        className={cn(
          "fixed inset-0 z-[9999] bg-white transition-transform duration-300 ease-out overflow-hidden",
          isAnimating ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          paddingTop: 'var(--safe-area-inset-top)',
          paddingBottom: 'calc(var(--safe-area-inset-bottom) + 1rem)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all duration-200 active:scale-95"
          style={{
            marginTop: 'calc(var(--safe-area-inset-top) + 1.5rem)'
          }}
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        {/* Content */}
        <div className="relative h-full overflow-y-auto hide-scrollbar">
          <div className="max-w-2xl mx-auto px-4 pt-8 pb-32 space-y-6">

            {/* Animated Mascot */}
            <div className="flex justify-center -mt-4 mb-4">
              <div className="relative w-80 h-80 bg-white">
                <video
                  ref={videoRef}
                  src={gatoFlexionesVideo}
                  loop
                  muted
                  playsInline
                  autoPlay
                  className="w-full h-full object-contain"
                  style={{
                    mixBlendMode: 'darken',
                    filter: 'brightness(1.1) contrast(1.2)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 100%)',
                    maskImage: 'linear-gradient(to bottom, black 0%, black 100%)'
                  }}
                />
              </div>
            </div>

            {/* Brand Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-md">
                <span className="font-bold text-gray-900">Gatofit</span>
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold">
                  Plus
                </span>
              </div>
            </div>

            {/* Hero Section */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                Alcanza tus<br />
                metas <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">5.3x</span> más<br />
                rápido
              </h1>

              <p className="text-base text-gray-600 max-w-md mx-auto">
                {getFeatureDescription()}
              </p>
            </div>

            {/* Plan Selection */}
            <div className="space-y-3">
              {/* Annual Plan - Most Popular */}
              <button
                onClick={() => setSelectedPlan('yearly')}
                className="w-full text-left relative"
                disabled={false} // Always allow selection to view details or switch
              >
                <div className={cn(
                  "absolute -inset-0.5 rounded-2xl opacity-20 transition-opacity",
                  isYearlyActive
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : selectedPlan === 'yearly'
                      ? "bg-gradient-to-r from-primary to-blue-500"
                      : "bg-gray-300"
                )}></div>
                <div className={cn(
                  "relative rounded-2xl p-5 space-y-3 transition-all",
                  isYearlyActive
                    ? "bg-gradient-to-br from-green-50 to-white border-2 border-green-500"
                    : selectedPlan === 'yearly'
                      ? "bg-gradient-to-br from-primary/5 to-white border-2 border-primary"
                      : "bg-white border-2 border-gray-300"
                )}>
                  <div className="flex items-center gap-2">
                    {isYearlyActive ? (
                      <div className="inline-block px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                        Activo
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
                          Más popular
                        </div>
                        {Capacitor.getPlatform() !== 'ios' && hasPromoCode && (
                          <div className="inline-block px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-sm animate-in fade-in zoom-in duration-300">
                            {promoCode ? `Código aplicado: ${promoCode}` : 'Código de descuento activo'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-lg font-bold text-gray-900">Prueba gratuita de</div>
                      <div className="text-lg font-bold text-gray-900">3 días</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-400 text-sm">$89.99</span>
                        <div className="text-3xl font-black text-gray-900">
                          {yearlyPrice}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                        año
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm bg-primary/10 w-fit px-3 py-1 rounded-full text-primary font-medium">
                    Equivale a <span className="font-bold">{getMonthlyPrice()}</span> por mes
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    Se cobrará al finalizar la prueba de 3 días
                  </div>
                </div>
              </button>
            </div>

            {/* Monthly Plan - Hidden by default with smooth animation */}
            <div className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              showAllPlans ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className="w-full text-left relative"
                >
                  <div className={cn(
                    "absolute -inset-0.5 rounded-2xl opacity-20 transition-opacity",
                    selectedPlan === 'monthly'
                      ? "bg-gradient-to-r from-primary to-blue-500"
                      : "bg-gray-300"
                  )}></div>
                  <div className={cn(
                    "relative rounded-2xl p-5 space-y-3 transition-all",
                    selectedPlan === 'monthly'
                      ? "bg-gradient-to-br from-primary/5 to-white border-2 border-primary"
                      : "bg-white border-2 border-gray-300"
                  )}>
                    <div className="text-sm text-gray-500">Pago por uso</div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-xl font-bold text-gray-900">Mensual</div>
                        <div className="text-xs text-gray-500 mt-1">Sin compromiso. Cancela cuando quieras.</div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900">
                          $8.99
                        </div>
                        <div className="text-sm text-gray-500">por mes</div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div >

            {/* Show/Hide Plans Button - Below monthly plan */}
            < button
              onClick={() => setShowAllPlans(!showAllPlans)}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
            >
              {showAllPlans ? 'Mostrar menos planes ▲' : 'Mostrar más planes ▼'}
            </button >

            {/* Promo Code Input - Hidden on iOS */}
            {Capacitor.getPlatform() !== 'ios' && (
              <div className="mt-4">
                <PromoCodeInput onCodeApplied={reloadPricing} />
              </div>
            )}

            {/* Features Comparison */}
            < div className="space-y-4" >
              <h3 className="text-xl font-bold text-gray-900 text-center">Lo que obtienes</h3>

              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-500"></div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-500">Gratis</div>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-blue-600/20">
                      <Crown className="h-3 w-3 text-primary" />
                      <span className="text-sm font-semibold text-primary">Plus</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {FEATURES_COMPARISON.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className={cn(
                        "grid grid-cols-3 gap-4 p-3 bg-white",
                        index !== FEATURES_COMPARISON.length - 1 && "border-b border-gray-100"
                      )}
                    >
                      <div className="flex items-center">
                        <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                      </div>

                      <div className="flex items-center justify-center">
                        {typeof item.free === 'string' ? (
                          <span className="text-xs text-gray-500 text-center">{item.free}</span>
                        ) : item.free ? (
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                            <Lock className="h-3 w-3 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div >

            {/* Social Proof Section */}
            <div className="pt-6 pb-2 space-y-6">
              <h3 className="text-4xl font-black text-gray-900 text-center tracking-tight leading-none px-2">
                Historias de éxito de nuestros clientes
              </h3>

              <TestimonialCarousel />

              {/* Stats with Stars */}
              <div className="flex justify-center gap-6 sm:gap-10 pt-2 pb-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-5 w-5 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 leading-none tracking-tight">4.8</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider leading-none">calificación<br />promedio</div>
                </div>

                <div className="w-px bg-gray-200"></div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1 text-primary">
                    <Users className="h-4 w-4 fill-current opacity-70" />
                    <Users className="h-5 w-5 fill-current" />
                    <Users className="h-4 w-4 fill-current opacity-70" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 leading-none tracking-tight">100K</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider leading-none">usuarios<br />globales</div>
                </div>
              </div>

              {/* Cancellation Policy & Links */}
              <div className="text-center space-y-4">
                <p className="text-[11px] text-gray-400 leading-relaxed px-2">
                  Tu suscripción anual o mensual se renovará automáticamente por el mismo período, a menos que la canceles al menos 24 horas antes de que termine el periodo actual. Puedes cancelarla en cualquier momento desde la App Store sin costo adicional; seguirá activa hasta que finalice el periodo pagado.
                </p>
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[11px] font-bold text-gray-800 pt-2">
                  <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Términos de uso</a>
                  <a href="https://gatofit.app/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Aviso de privacidad</a>
                </div>
              </div>
            </div>

          </div >
        </div >

        {/* CTA Button - Fixed at bottom */}
        < div
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4 px-4 z-10"
          style={{
            paddingBottom: 'calc(1rem + var(--safe-area-inset-bottom))'
          }}
        >
          <button
            onClick={handleUpgrade}
            disabled={isPurchasing || isCurrentPlanActive}
            className={cn(
              "w-full h-14 text-lg font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2",
              (isPurchasing || isCurrentPlanActive) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPurchasing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : isCurrentPlanActive ? (
              'Plan Activo'
            ) : selectedPlan === 'yearly' ? (
              'Prueba gratis de 3 días'
            ) : (
              'Suscribirse mensualmente'
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-gray-400">
            <Check className="h-3.5 w-3.5" />
            <span>Sin pago ahora. Fácil de cancelar.</span>
          </div>
        </div >
      </div >
    </>
  );

  // Render modal using portal to ensure it's on top of everything
  return createPortal(modalContent, document.body);
};
