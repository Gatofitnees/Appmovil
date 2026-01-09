
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Calendar, ArrowUpCircle, List, Calculator, BookOpenCheck } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";
import { OnboardingContext } from "../OnboardingFlow";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import SwipeableCarousel from "@/components/onboarding/SwipeableCarousel";
import GatofitAILogo from "@/components/GatofitAILogo";

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-6 rounded-3xl bg-secondary/20 border border-white/5 text-center min-h-[320px] h-auto w-full max-w-sm mx-auto shadow-sm backdrop-blur-sm"
    >
      <div className="bg-primary/10 p-8 rounded-full mb-8">
        {React.cloneElement(icon as React.ReactElement, { size: 64 })}
      </div>
      <h3 className="font-bold text-3xl mb-4">{title}</h3>
      <p className="text-muted-foreground text-xl leading-relaxed">{description}</p>
    </div>
  );
};

const FeaturesPreview: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("FeaturesPreview must be used within OnboardingContext");
  }

  const features = [
    {
      title: "Planes de Entrenamiento Personalizados",
      description: "Rutinas adaptadas a tus objetivos, nivel de experiencia y preferencias.",
      icon: <Calendar className="text-primary" />,
    },
    {
      title: "Seguimiento Nutricional Inteligente",
      description: "Controla macros y calorías con un sistema inteligente que aprende de tus hábitos.",
      icon: <Calculator className="text-primary" />,
    },
    {
      title: "Análisis de Progreso",
      description: "Visualiza tu evolución con gráficos detallados y métricas personalizadas.",
      icon: <BarChart3 className="text-primary" />,
    },
    {
      title: "Logros y Retos",
      description: "Mantén tu motivación con desafíos adaptados a tu nivel y celebra tus victorias.",
      icon: <ArrowUpCircle className="text-primary" />,
    },
    {
      title: "Biblioteca de Ejercicios",
      description: "Accede a cientos de ejercicios con guías detalladas y videos demostrativos.",
      icon: <BookOpenCheck className="text-primary" />,
    },
    {
      title: "Planes de Comidas",
      description: "Descubre recetas saludables que se alinean con tus objetivos nutricionales.",
      icon: <List className="text-primary" />,
    },
  ];

  // Auto-scroll logic removed from here as it's handled by SwipeableCarousel now
  // We just sync state if needed, but SwipeableCarousel drives it.
  // Actually, we need to pass autoScroll to SwipeableCarousel.

  const handleNext = () => {
    navigate("/onboarding/create-account");
  };

  return (
    <OnboardingLayout currentStep={17} totalSteps={20} className="h-full">
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Descubre cómo <GatofitAILogo size="lg" className="inline-block" /> te impulsará
        </h1>

        <p className="text-muted-foreground mb-4 text-center px-4">
          Estas son algunas de las características clave que te ayudarán a alcanzar tus objetivos
        </p>

        <div className="w-full flex-1 flex flex-col justify-center overflow-hidden min-h-[400px]">
          <div className="flex-grow h-full py-4">
            <SwipeableCarousel
              autoScroll
              autoScrollInterval={4000}
              currentSlide={currentSlide}
              onSlideChange={setCurrentSlide}
              cardsPerView={1}
              className="h-full"
            >
              {features.map((feature, index) => (
                <div key={index} className="px-2 py-1 h-full">
                  <div className="h-full max-w-[85vw] mx-auto">
                    <FeatureCard
                      title={feature.title}
                      description={feature.description}
                      icon={feature.icon}
                    />
                  </div>
                </div>
              ))}
            </SwipeableCarousel>
          </div>
        </div>
      </div>

      <OnboardingNavigation
        onNext={handleNext}
        nextLabel="Crear Cuenta"
      />
    </OnboardingLayout>
  );
};

export default FeaturesPreview;
