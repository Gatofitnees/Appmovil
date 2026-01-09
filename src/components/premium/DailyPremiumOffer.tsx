import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import Button from '@/components/Button';

export const DailyPremiumOffer: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { isPremium, isAsesorado, isLoading } = useSubscription();
    const navigate = useNavigate();

    useEffect(() => {
        // Strict check: if premium/asesorado, NEVER show offer.
        if (isPremium || isAsesorado) {
            setIsVisible(false); // Ensure it's closed
            return;
        }

        // Only proceed if subscription data is loaded
        if (!isLoading) {
            checkAndShowOffer();
        }
    }, [isLoading, isPremium, isAsesorado]);

    const checkAndShowOffer = () => {
        const lastShownDate = localStorage.getItem('last_premium_offer_shown');
        const today = new Date().toDateString();

        if (lastShownDate !== today) {
            // Show offer
            setIsVisible(true);
            // Mark as shown today
            localStorage.setItem('last_premium_offer_shown', today);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleSubscribe = () => {
        setIsVisible(false);
        navigate('/subscription');
    };

    // Benefits list
    const benefits = [
        { text: "Rutinas ilimitadas", icon: Zap },
        { text: "Análisis nutricional por foto ilimitado", icon: Sparkles },
        { text: "Planes de entrenamiento Gatofit", icon: TrendingUp },
        { text: "Chat prioritario con tu Coach IA", icon: Crown },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#141B24] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/60 hover:text-white hover:bg-black/40 transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        {/* Hero Section */}
                        <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center text-center p-6">
                            <div className="absolute inset-0 bg-[url('https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/gato%20banner.gif')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                            <div className="relative z-10 text-white">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full inline-flex mb-3 shadow-lg">
                                    <Crown className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                                </div>
                                <h2 className="text-2xl font-bold mb-1">Desbloquea Todo el Poder</h2>
                                <p className="text-white/80 text-sm">Lleva tu entrenamiento al siguiente nivel</p>
                            </div>

                            {/* Curve Separator */}
                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#141B24] rounded-t-[20px] translate-y-1"></div>
                        </div>

                        {/* Content Section */}
                        <div className="px-6 pb-6 pt-2 bg-[#141B24]">
                            <div className="space-y-4 mb-8">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                            <benefit.icon className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">{benefit.text}</span>
                                        <Check className="w-4 h-4 text-green-400 ml-auto" />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    onClick={handleSubscribe}
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-500 to-purple-600 border-0"
                                >
                                    Obtener Premium
                                </Button>

                                <p className="text-xs text-center text-slate-500">
                                    Cancela en cualquier momento. Sin compromisos a largo plazo.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
