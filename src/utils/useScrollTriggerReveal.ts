import { useEffect, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealOptions {
  selector?: string;
  stagger?: number;
  duration?: number;
  yOffset?: number;
  scaleFrom?: number;
  start?: string;
  threshold?: number;
}

/**
 * Custom hook to attach GSAP ScrollTrigger animations to sections and cards as they enter the viewport.
 * As user scrolls:
 * - sections move into view with depth
 * - cards slightly scale from 0.94 to 1
 * - opacity transitions smoothly
 * Automatically cleans up ScrollTrigger instances on unmount via gsap.context.
 */
export function useScrollTriggerReveal(
  containerRef: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const shouldReduceMotion = useReducedMotion();
  const {
    selector = ".gsap-reveal-card",
    stagger = 0.08,
    duration = 0.65,
    yOffset = 22,
    scaleFrom = 0.94, // Requirement 7: scale from 0.94 to 1
    start = "top 88%",
  } = options;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    if (shouldReduceMotion) {
      // Immediately ensure all elements are visible without motion
      const elements = containerRef.current.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray(selector, containerRef.current);
      if (!elements || elements.length === 0) return;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: yOffset,
          scale: scaleFrom,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            once: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [containerRef, selector, stagger, duration, yOffset, scaleFrom, start, shouldReduceMotion]);
}

/**
 * Antigravity camera scroll effect:
 * Tracks scroll velocity and shifts background glow & depth planes,
 * creating a subtle "camera moving through an AI workspace" effect without aggressive zooming.
 */
export function useAntigravityScrollCamera(containerRef: RefObject<HTMLElement | null>) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined" || shouldReduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const ambientOrbs = document.querySelectorAll(".ambient-orb-1, .ambient-orb-2, .ambient-orb-3, .ambient-orb-4");

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const velocity = self.getVelocity();
          const clampedShift = Math.max(-18, Math.min(18, velocity * 0.005));

          if (ambientOrbs.length > 0) {
            gsap.to(ambientOrbs, {
              y: clampedShift,
              duration: 0.8,
              ease: "power1.out",
              overwrite: "auto",
            });
          }
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [containerRef, shouldReduceMotion]);
}

/**
 * Custom hook specifically designed for the 5-step "How It Works" / user journey cards.
 * Reveals the 5 steps sequentially with a staggered, fluid animation when they enter the viewport.
 */
export function useStaggeredStepsReveal(
  containerRef: RefObject<HTMLElement | null>,
  options: { selector?: string; stagger?: number; duration?: number; start?: string } = {}
) {
  const shouldReduceMotion = useReducedMotion();
  const {
    selector = ".gsap-step-card",
    stagger = 0.12,
    duration = 0.55,
    start = "top 85%",
  } = options;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    if (shouldReduceMotion) {
      const elements = containerRef.current.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray(selector, containerRef.current);
      if (!steps || steps.length === 0) return;

      gsap.fromTo(
        steps,
        {
          opacity: 0,
          y: 20,
          scale: 0.94,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          stagger,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            once: true,
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [containerRef, selector, stagger, duration, start, shouldReduceMotion]);
}
