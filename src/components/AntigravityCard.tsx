import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

interface AntigravityCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  floatDuration?: number; // e.g. 5.5, 6.7, 7.8s
  floatDistance?: number; // 4 to 8px
  floatRotation?: number; // 0.5 to 1.5 deg
  floatDelay?: number;
  enableFloating?: boolean;
  enableMouseGravity?: boolean;
  enableTilt?: boolean;
  purpleGlow?: boolean;
  id?: string;
}

export const AntigravityCard: React.FC<AntigravityCardProps> = ({
  children,
  className = "",
  floatDuration = 6.4,
  floatDistance = 6,
  floatRotation = 0.8,
  floatDelay = 0,
  enableFloating = true,
  enableMouseGravity = true,
  enableTilt = true,
  purpleGlow = false,
  id,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || !cardRef.current || (!enableTilt && !enableMouseGravity)) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates from -1 to 1
      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      // Subtle rotation max 2.5 degrees for maximum readability and Apple-level restraint
      const rotateX = enableTilt ? -normY * 2.4 : 0;
      const rotateY = enableTilt ? normX * 2.4 : 0;

      // Subtle translation towards cursor max 4-5px
      const moveX = enableMouseGravity ? normX * 4.5 : 0;
      const moveY = enableMouseGravity ? normY * 4.5 : 0;

      setTilt({ rotateX, rotateY, x: moveX, y: moveY });
    },
    [shouldReduceMotion, enableTilt, enableMouseGravity]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className} {...props}>
        {children}
      </div>
    );
  }

  // Floating keyframe values
  const floatAnimation = enableFloating && !isHovered
    ? {
        y: [0, -floatDistance, 0],
        rotate: [0, floatRotation, 0, -floatRotation * 0.7, 0],
      }
    : {
        y: 0,
        rotate: 0,
      };

  return (
    <div
      style={{ perspective: 1100 }}
      className="relative will-change-transform"
      id={id}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={
          isHovered
            ? {
                x: tilt.x,
                y: tilt.y,
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                rotate: 0,
                scale: 1.008,
              }
            : floatAnimation
        }
        transition={
          isHovered
            ? {
                type: "spring",
                stiffness: 280,
                damping: 24,
                mass: 0.6,
              }
            : {
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }
        }
        style={{
          transformStyle: "preserve-3d",
        }}
        className={`relative ${
          purpleGlow
            ? "shadow-[0_20px_48px_-12px_rgba(99,102,241,0.22)] dark:shadow-[0_24px_54px_-12px_rgba(99,102,241,0.32)]"
            : ""
        } ${className}`}
        {...(props as any)}
      >
        {purpleGlow && (
          <div
            className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-indigo-500/15 opacity-60 blur-sm pointer-events-none -z-10"
            aria-hidden="true"
          />
        )}
        {children}
      </motion.div>
    </div>
  );
};
