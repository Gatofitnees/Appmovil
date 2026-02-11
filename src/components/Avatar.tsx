import React, { useState } from "react";
import ProgressRing from "./ProgressRing";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

interface AvatarProps {
  src?: string;
  name: string;
  progress?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  isPremium?: boolean;
  isAsesorado?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  progress = 0,
  size = "md",
  className,
  isPremium = false,
  isAsesorado = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { branding } = useBranding();

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-20 h-20 text-base",
  };

  const crownSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  const ringSize = size === "sm" ? 40 : size === "md" ? 64 : 80;
  // const ringStrokeWidth = size === "sm" ? 2 : 3; // Unused

  // Log para debug


  const handleImageError = () => {

    setImageError(true);
  };

  const handleImageLoad = () => {

    setImageLoaded(true);
    setImageError(false);
  };

  // Determine if we should show image or initials
  const shouldShowImage = src && !imageError && imageLoaded;
  const shouldShowInitials = !src || imageError || !imageLoaded;

  const brandColor = branding.primaryButtonColor || '#ef4444'; // Fallback to red if missing

  return (
    <div className={cn("relative inline-flex", className)}>
      <ProgressRing
        progress={progress}
        size={ringSize}
      />
      {/* Premium golden ring - Hidden if isAsesorado is true to prioritize custom border */}
      {isPremium && !isAsesorado && (
        <div
          className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-yellow-400 to-orange-500"
          style={{
            background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
            padding: '2px',
            borderRadius: '50%'
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      )}

      {/* Asesorado custom ring */}
      {isAsesorado && (
        <div
          className="absolute inset-0 rounded-full border-2"
          style={{
            background: `linear-gradient(45deg, ${brandColor}, ${brandColor})`,
            padding: '2px',
            borderRadius: '50%'
          }}
        >
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      )}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary flex items-center justify-center overflow-hidden",
          // Removed static border classes for isAsesorado to use dynamic style
          !isAsesorado && (isPremium ? "border-2 border-yellow-400 shadow-lg shadow-yellow-400/20" : "border border-black/10"),
          sizeClasses[size]
        )}
        style={isAsesorado ? {
          borderWidth: '2px',
          borderColor: brandColor,
          boxShadow: `0 10px 15px -3px ${brandColor}33, 0 4px 6px -2px ${brandColor}1a` // approximate shadow-lg with opacity
        } : undefined}
      >
        {src && !imageError && (
          <img
            src={src}
            alt={name}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        )}
        {shouldShowInitials && (
          <span className="font-medium text-gray-200">{initials}</span>
        )}
      </div>

      {/* Premium Crown - Hidden if isAsesorado is true */}
      {isPremium && !isAsesorado && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <Crown
              className={cn(
                crownSizes[size],
                "text-yellow-400 transform rotate-45 drop-shadow-lg"
              )}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }}
            />
            {/* Subtle glow effect */}
            <Crown
              className={cn(
                crownSizes[size],
                "absolute top-0 left-0 text-yellow-300 transform rotate-45 opacity-60"
              )}
              style={{
                filter: 'blur(2px)'
              }}
            />
          </div>
        </div>
      )}

      {/* Asesorado Crown - Red version - Hidden per user request */}
      {false && isAsesorado && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <Crown
              className={cn(
                crownSizes[size],
                "text-red-500 transform rotate-45 drop-shadow-lg"
              )}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }}
            />
            {/* Subtle glow effect */}
            <Crown
              className={cn(
                crownSizes[size],
                "absolute top-0 left-0 text-red-400 transform rotate-45 opacity-60"
              )}
              style={{
                filter: 'blur(2px)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
