
import React from "react";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}, ref) => {
  const { branding } = useBranding();

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 shadow-neu-button active:shadow-neu-button-active overflow-hidden";

  const variantClasses = {
    primary: "text-white border-none",
    secondary: "bg-secondary/70 hover:bg-secondary/50 text-foreground border-none",
    outline: "bg-transparent border border-muted hover:bg-secondary/10 text-foreground"
  };

  const sizeClasses = {
    sm: "text-xs py-1.5 px-3",
    md: "text-sm py-2 px-4",
    lg: "text-base py-3 px-6"
  };

  // Si es primary y tiene coach, usar colores del coach
  const customStyles = variant === 'primary' && branding.hasCoach
    ? {
      backgroundColor: branding.primaryButtonFillColor,
      borderColor: branding.primaryButtonColor,
    }
    : variant === 'primary'
      ? {
        backgroundColor: 'hsl(var(--primary))',
      }
      : {};

  const hoverClass = variant === 'primary' && !branding.hasCoach
    ? 'hover:bg-primary/90'
    : '';

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        hoverClass,
        className
      )}
      style={customStyles}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
