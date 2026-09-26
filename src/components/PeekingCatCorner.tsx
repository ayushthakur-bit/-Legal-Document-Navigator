import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface PeekingCatCornerProps {
  isAnalyzing: boolean;
}

export const PeekingCatCorner: React.FC<PeekingCatCornerProps> = ({ isAnalyzing }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isAnalyzing && (
        <motion.div
          id="peeking-cat-analyzer"
          initial={shouldReduceMotion ? { opacity: 0 } : { y: 110, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : {
                  y: [0, -6, 0, -4, 0],
                  opacity: 1,
                }
          }
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 110, opacity: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.2 }
              : {
                  y: {
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  opacity: { duration: 0.35 },
                }
          }
          className="fixed bottom-0 right-4 sm:right-10 z-[60] pointer-events-none select-none flex flex-col items-center"
          aria-hidden={!isAnalyzing}
          role="status"
          aria-label="Cat peeking while document is being analyzed"
        >
          {/* Subtle playful tooltip speech bubble */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-1 px-3 py-1 rounded-full bg-slate-900/90 dark:bg-slate-800/95 border border-indigo-400/40 text-white shadow-xl backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5"
          >
            <span className="text-amber-400 animate-pulse text-xs">🐾</span>
            <span className="tracking-wide">Analyzing clauses...</span>
          </motion.div>

          {/* SVG Peeking Cat illustration */}
          <div className="relative w-32 h-24 sm:w-36 sm:h-28 overflow-visible">
            <svg
              viewBox="0 0 140 100"
              className="w-full h-full overflow-visible drop-shadow-xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Cat fur gradient */}
                <linearGradient id="peekCatFur" x1="20" y1="10" x2="120" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="60%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>

                {/* Inner ear pink */}
                <linearGradient id="peekEarPink" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDA4AF" />
                  <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>

                {/* Spectacles glass tint */}
                <linearGradient id="peekGlassTint" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* CAT HEAD & EARS CONTAINER */}
              <g>
                {/* Left Ear */}
                <motion.g
                  animate={
                    shouldReduceMotion
                      ? false
                      : {
                          rotate: [-3, 4, -3],
                        }
                  }
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "42px 34px" }}
                >
                  <polygon points="30,42 42,12 58,35" fill="url(#peekCatFur)" stroke="#9A3412" strokeWidth="1.5" />
                  <polygon points="34,40 43,18 53,35" fill="url(#peekEarPink)" />
                </motion.g>

                {/* Right Ear */}
                <motion.g
                  animate={
                    shouldReduceMotion
                      ? false
                      : {
                          rotate: [3, -4, 3],
                        }
                  }
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                  style={{ transformOrigin: "98px 34px" }}
                >
                  <polygon points="82,35 98,12 110,42" fill="url(#peekCatFur)" stroke="#9A3412" strokeWidth="1.5" />
                  <polygon points="87,35 97,18 106,40" fill="url(#peekEarPink)" />
                </motion.g>

                {/* Cat Head Circle / Dome */}
                <path
                  d="M32 60 C32 36, 108 36, 108 60 C108 85, 32 85, 32 60 Z"
                  fill="url(#peekCatFur)"
                  stroke="#9A3412"
                  strokeWidth="1.6"
                />

                {/* White Face Mask / Cheek Patches */}
                <ellipse cx="70" cy="68" rx="24" ry="15" fill="#FFF7ED" />

                {/* Pink Nose */}
                <polygon points="68,64 72,64 70,68" fill="#FB7185" />
                {/* Mouth curve */}
                <path
                  d="M70 68 Q67 72 64 70 M70 68 Q73 72 76 70"
                  stroke="#9A3412"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />

                {/* Whiskers */}
                <g stroke="#FED7AA" strokeWidth="1.2" strokeLinecap="round">
                  <line x1="78" y1="66" x2="94" y2="64" />
                  <line x1="78" y1="69" x2="96" y2="70" />
                  <line x1="77" y1="72" x2="93" y2="75" />

                  <line x1="62" y1="66" x2="46" y2="64" />
                  <line x1="62" y1="69" x2="44" y2="70" />
                  <line x1="63" y1="72" x2="47" y2="75" />
                </g>

                {/* Big Curious Feline Eyes with Blinking */}
                <motion.g
                  animate={
                    shouldReduceMotion
                      ? false
                      : {
                          scaleY: [1, 1, 0.1, 1, 1],
                        }
                  }
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    times: [0, 0.44, 0.48, 0.52, 1],
                  }}
                  style={{ transformOrigin: "70px 52px" }}
                >
                  {/* Left Eye */}
                  <ellipse cx="56" cy="52" rx="6" ry="6.5" fill="#10B981" />
                  <ellipse cx="56.5" cy="52" rx="3" ry="5.8" fill="#064E3B" />
                  <circle cx="55" cy="50" r="1.8" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <ellipse cx="84" cy="52" rx="6" ry="6.5" fill="#10B981" />
                  <ellipse cx="84.5" cy="52" rx="3" ry="5.8" fill="#064E3B" />
                  <circle cx="83" cy="50" r="1.8" fill="#FFFFFF" />
                </motion.g>

                {/* Tiny Blue Legal Glasses */}
                <g stroke="#38BDF8" strokeWidth="1.4" fill="url(#peekGlassTint)">
                  <circle cx="56" cy="52" r="8" />
                  <circle cx="84" cy="52" r="8" />
                  <line x1="64" y1="52" x2="76" y2="52" />
                </g>
              </g>

              {/* TWO FRONT PAWS (Hooked over the bottom edge of the screen) */}
              {/* Left Paw */}
              <g>
                <ellipse cx="46" cy="94" rx="10" ry="7" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.2" />
                <line x1="43" y1="91" x2="43" y2="97" stroke="#EA580C" strokeWidth="0.8" />
                <line x1="48" y1="91" x2="48" y2="97" stroke="#EA580C" strokeWidth="0.8" />
              </g>

              {/* Right Paw */}
              <g>
                <ellipse cx="94" cy="94" rx="10" ry="7" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.2" />
                <line x1="91" y1="91" x2="91" y2="97" stroke="#EA580C" strokeWidth="0.8" />
                <line x1="96" y1="91" x2="96" y2="97" stroke="#EA580C" strokeWidth="0.8" />
              </g>
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
