import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealOptions {
  triggerSelector?: string;
  itemSelector?: string;
  stagger?: number;
  y?: number;
  duration?: number;
  scale?: number;
  delay?: number;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect user's reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const {
      triggerSelector = ".gsap-reveal-container",
      itemSelector = ".gsap-reveal-item",
      stagger = 0.08,
      y = 20,
      duration = 0.7,
      scale = 0.98,
      delay = 0,
    } = options;

    const ctx = gsap.context(() => {
      const triggers = document.querySelectorAll(triggerSelector);
      triggers.forEach((trigger) => {
        const items = trigger.querySelectorAll(itemSelector);
        if (items.length > 0) {
          gsap.fromTo(
            items,
            {
              opacity: 0,
              y: y,
              scale: scale,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: duration,
              stagger: stagger,
              delay: delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: trigger,
                start: "top 88%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        }
      });
    });

    return () => ctx.revert();
  }, [options.triggerSelector, options.itemSelector, options.stagger, options.y, options.duration, options.scale, options.delay]);
}
