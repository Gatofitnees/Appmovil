import React, { useEffect, useState } from 'react';
import { CheckCircle, Crown, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PurchaseSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planType: 'monthly' | 'yearly';
  mode?: 'purchase' | 'restore';
}

export const PurchaseSuccessDialog: React.FC<PurchaseSuccessDialogProps> = ({
  isOpen,
  onClose,
  planName,
  planType,
  mode = 'purchase',
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  const title = mode === 'restore' ? 'Suscripción restaurada' : '¡Felicidades!';
  const subtitle = mode === 'restore'
    ? 'Tu acceso premium ha sido restaurado correctamente'
    : 'Tu suscripción ha sido activada';

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-primary/30"
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>

        {/* Contenido */}
        <div className="space-y-6 text-center">
          {/* Icono animado */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full blur-lg opacity-75"></div>
              <div className="relative h-20 w-20 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Título */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Detalles del plan */}
          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan seleccionado:</span>
              <span className="font-semibold text-primary">{planName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duración:</span>
              <span className="font-semibold text-white">
                {planType === 'yearly' ? '1 año' : '1 mes'}
              </span>
            </div>
            <div className="w-full h-px bg-slate-700 my-2"></div>
            <p className="text-xs text-green-400 font-medium">
              ✓ Acceso a todas las funciones premium
            </p>
          </div>

          {/* Mensaje */}
          <p className="text-sm text-muted-foreground">
            Ya puedes disfrutar de rutinas ilimitadas, análisis nutricional IA y chat 24/7.
          </p>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continuar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
