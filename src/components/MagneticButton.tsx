import React, { useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number; // 0.1 to 0.4
  iconStrength?: number; // 0.15 to 0.6
  glowColor?: string;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.22,
  iconStrength = 0.36,
  glowColor = "rgba(99, 102, 241, 0.45)",
  className = "",
  disabled,
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (shouldReduceMotion || disabled || !buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Limit max translation to 7px for subtle Apple-level restraint
      const maxDist = 7;
      const moveX = Math.max(-maxDist, Math.min(maxDist, deltaX * strength));
      const moveY = Math.max(-maxDist, Math.min(maxDist, deltaY * strength));

      const iconMaxDist = 11;
      const iconX = Math.max(-iconMaxDist, Math.min(iconMaxDist, deltaX * iconStrength));
      const iconY = Math.max(-iconMaxDist, Math.min(iconMaxDist, deltaY * iconStrength));

      setPosition({ x: moveX, y: moveY });
      setIconPosition({ x: iconX, y: iconY });
    },
    [shouldReduceMotion, disabled, strength, iconStrength]
  );

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
    setIconPosition({ x: 0, y: 0 });
  };

  if (shouldReduceMotion) {
    return (
      <button
        ref={buttonRef}
        disabled={disabled}
        onClick={onClick}
        className={className}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
        mass: 0.5,
      }}
      className={`relative group ${className}`}
      {...(props as any)}
    >
      {/* Magnetic dynamic aura glow */}
      <span
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-md -z-10"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Content wrapper with independent icon parallax via CSS child selector */}
      <span
        className="inline-flex items-center gap-1.5 w-full h-full justify-center transition-transform"
        style={{
          transform: `translate3d(${iconPosition.x * 0.4}px, ${iconPosition.y * 0.4}px, 0)`,
        }}
      >
        {children}
      </span>
    </motion.button>
  );
};
