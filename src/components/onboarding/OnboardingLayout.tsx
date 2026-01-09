import React from "react";
import { motion } from "framer-motion";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  // Props are now optional/ignored as layout logic is moved to OnboardingFlow
  currentStep?: number;
  totalSteps?: number;
  showProgress?: boolean;
  className?: string;
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const containerVariants = {
  initial: { opacity: 1 },
  in: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2 // Wait for page to slide in slightly
    }
  },
  out: { opacity: 0 }
};

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="in"
      exit="out"
      className={`flex-1 flex flex-col h-full ${className}`}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants} className="w-full">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default OnboardingLayout;
