
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/onboarding/LoginModal";
import welcomeVideo from "@/assets/lottie/presentar.mp4";

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleStart = () => {
    navigate("/onboarding/gender");
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <OnboardingLayout currentStep={1} totalSteps={20} className="overflow-hidden h-screen">
      <div className="flex flex-col h-full">
        {/* Video Section - Takes available space */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full flex items-center justify-center [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent),linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]"
          >
            <video
              src={welcomeVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Bottom Section - Title, Button, Link */}
        <div className="flex-shrink-0 px-6 pb-6 pt-0 bg-background z-10 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold text-center mb-4 leading-tight max-w-xs mx-auto"
          >
            Consigue el cuerpo que sueñas
          </motion.h1>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            onClick={handleStart}
            className="w-full max-w-sm bg-primary text-primary-foreground font-bold text-lg py-4 rounded-full mb-4 shadow-lg hover:shadow-xl transition-all"
          >
            Comenzar ahora
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={handleLogin}
              className="font-semibold text-foreground hover:underline focus:outline-none"
            >
              Iniciar sesión
            </button>
          </motion.p>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </OnboardingLayout>
  );
};

export default Welcome;
