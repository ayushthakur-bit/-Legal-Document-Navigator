import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface AnimatedMovingCatProps {
  statusText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AnimatedMovingCat: React.FC<AnimatedMovingCatProps> = ({
  statusText = "Inspecting document clauses & sniffing out fine-print traps...",
  size = "md",
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Dynamic sizing
  const scale = size === "sm" ? 0.75 : size === "lg" ? 1.25 : 1;

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden py-3 select-none ${className}`}
      aria-label="Animated cat inspecting document"
    >
      {/* Speech / Thought Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.3 },
          y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
        }}
        className="mb-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-indigo-700/60 shadow-md backdrop-blur-sm text-center relative z-20"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">🐾</span>
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide font-display">
            {statusText}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold font-mono">
            AI Cat Inspector
          </span>
        </div>
        {/* Tiny thought bubble pointer dots */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 dark:bg-indigo-700" />
        </div>
      </motion.div>

      {/* Runway / Document Inspection Track */}
      <div className="relative w-full max-w-md h-28 flex items-center justify-center overflow-hidden">
        {/* Subtle Laser Scanning Grid on the floor */}
        <div className="absolute bottom-2 inset-x-4 h-12 rounded-2xl bg-gradient-to-t from-indigo-500/10 via-cyan-500/5 to-transparent border-b border-indigo-400/30 overflow-hidden pointer-events-none">
          <motion.div
            animate={
              shouldReduceMotion
                ? false
                : {
                    x: ["-100%", "100%"],
                  }
            }
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-sm"
          />
        </div>

        {/* Faint Glowing Paw Prints appearing on the scanning line */}
        {!shouldReduceMotion && (
          <div className="absolute bottom-3 inset-x-8 flex justify-between pointer-events-none opacity-40">
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.1, scale: 0.8 }}
                animate={{
                  opacity: [0.1, 0.7, 0.1],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeInOut",
                }}
                className="text-[10px] text-indigo-400 dark:text-indigo-300"
              >
                🐾
              </motion.span>
            ))}
          </div>
        )}

        {/* Moving Cat Container (Walks back and forth smoothly across the runway) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? false
              : {
                  x: [-95, 95, 95, -95, -95],
                  scaleX: [1, 1, -1, -1, 1],
                }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.46, 0.5, 0.96, 1],
          }}
          style={{ transformOrigin: "center center" }}
          className="relative z-10 cursor-pointer"
        >
          {/* Gentle Walking Body Bounce */}
          <motion.div
            animate={
              shouldReduceMotion
                ? false
                : {
                    y: [0, -3.5, 0],
                  }
            }
            transition={{
              duration: 0.45,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative"
            style={{ width: 140 * scale, height: 85 * scale }}
          >
            {/* SVG Cat Character Illustration */}
            <svg
              viewBox="0 0 160 100"
              className="w-full h-full drop-shadow-md overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Cat Fur Gradient: Warm ginger tabby with soft tones */}
                <linearGradient id="catBodyGrad" x1="20" y1="20" x2="140" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="60%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>

                {/* Chest/Belly Fluff Gradient */}
                <linearGradient id="catBellyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFF7ED" />
                  <stop offset="100%" stopColor="#FED7AA" />
                </linearGradient>

                {/* Spectacles / Glass Frame */}
                <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Shadow underneath */}
              <ellipse cx="80" cy="94" rx="45" ry="6" fill="#0f172a" fillOpacity="0.18" />

              {/* TAIL (Swinging / Wagging gracefully) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        rotate: [-14, 24, -14],
                      }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "26px 65px" }}
              >
                <path
                  d="M26 65 C15 62, 2 50, 4 34 C5 22, 16 16, 22 22 C26 26, 22 36, 17 44 C22 55, 26 60, 28 64 Z"
                  fill="url(#catBodyGrad)"
                  stroke="#9A3412"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* White tip on tail */}
                <circle cx="20" cy="22" r="5" fill="#FFF7ED" />
              </motion.g>

              {/* BACK LEG 2 (Far side - walks in sync) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        rotate: [20, -20, 20],
                      }
                }
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "42px 68px" }}
              >
                <rect x="38" y="65" width="8" height="24" rx="4" fill="#C2410C" />
                <ellipse cx="42" cy="89" rx="5.5" ry="3.5" fill="#FED7AA" />
              </motion.g>

              {/* FRONT LEG 2 (Far side - alternating walk) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        rotate: [-22, 22, -22],
                      }
                }
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "110px 68px" }}
              >
                <rect x="106" y="65" width="8" height="24" rx="4" fill="#C2410C" />
                <ellipse cx="110" cy="89" rx="5.5" ry="3.5" fill="#FED7AA" />
              </motion.g>

              {/* MAIN BODY TORSO */}
              <rect
                x="32"
                y="40"
                width="84"
                height="38"
                rx="19"
                fill="url(#catBodyGrad)"
                stroke="#9A3412"
                strokeWidth="1.5"
              />

              {/* White chest fluff & belly bib */}
              <path
                d="M80 50 Q105 52 112 60 Q114 74 100 77 Q75 78 68 66 Z"
                fill="url(#catBellyGrad)"
                opacity="0.92"
              />

              {/* Attorney Green Bowtie / Legal Medallion */}
              <g transform="translate(108, 56)">
                <polygon points="-6,-4 0,0 -6,4" fill="#059669" />
                <polygon points="6,-4 0,0 6,4" fill="#059669" />
                <circle cx="0" cy="0" r="2.5" fill="#F59E0B" />
              </g>

              {/* BACK LEG 1 (Near side - main walking stride) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        rotate: [-20, 20, -20],
                      }
                }
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "48px 68px" }}
              >
                <rect x="44" y="65" width="9" height="25" rx="4.5" fill="url(#catBodyGrad)" stroke="#9A3412" strokeWidth="1" />
                <ellipse cx="48.5" cy="90" rx="6" ry="4" fill="#FFF7ED" stroke="#EA580C" strokeWidth="0.8" />
                {/* Tiny toe divisions */}
                <line x1="47" y1="89" x2="47" y2="92" stroke="#EA580C" strokeWidth="0.7" />
                <line x1="50" y1="89" x2="50" y2="92" stroke="#EA580C" strokeWidth="0.7" />
              </motion.g>

              {/* FRONT LEG 1 (Near side - alternating stride) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        rotate: [22, -22, 22],
                      }
                }
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "98px 68px" }}
              >
                <rect x="94" y="65" width="9" height="25" rx="4.5" fill="url(#catBodyGrad)" stroke="#9A3412" strokeWidth="1" />
                <ellipse cx="98.5" cy="90" rx="6" ry="4" fill="#FFF7ED" stroke="#EA580C" strokeWidth="0.8" />
                {/* Tiny toe divisions */}
                <line x1="97" y1="89" x2="97" y2="92" stroke="#EA580C" strokeWidth="0.7" />
                <line x1="100" y1="89" x2="100" y2="92" stroke="#EA580C" strokeWidth="0.7" />
              </motion.g>

              {/* HEAD GROUP (With ears, cute face, and inspector glasses) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? false
                    : {
                        rotate: [-2, 3, -2],
                      }
                }
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "125px 38px" }}
              >
                {/* Left Ear (Perked with pink inside) */}
                <polygon points="112,28 118,10 128,24" fill="#EA580C" stroke="#9A3412" strokeWidth="1.2" />
                <polygon points="115,25 119,14 125,23" fill="#FDA4AF" />

                {/* Right Ear (Perked with pink inside) */}
                <polygon points="132,24 142,10 148,28" fill="#EA580C" stroke="#9A3412" strokeWidth="1.2" />
                <polygon points="135,23 141,14 145,25" fill="#FDA4AF" />

                {/* Head circle */}
                <circle cx="130" cy="38" r="19" fill="url(#catBodyGrad)" stroke="#9A3412" strokeWidth="1.5" />

                {/* White snout / muzzle patch */}
                <ellipse cx="135" cy="44" rx="9" ry="6.5" fill="#FFF7ED" />

                {/* Cute Pink Nose */}
                <polygon points="134,41 138,41 136,44" fill="#FB7185" />
                {/* Cat Mouth */}
                <path d="M136 44 Q134 47 132 46 M136 44 Q138 47 140 46" stroke="#9A3412" strokeWidth="1" strokeLinecap="round" />

                {/* Whiskers (Left & Right) */}
                <line x1="140" y1="42" x2="152" y2="40" stroke="#FFF7ED" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="141" y1="44" x2="154" y2="45" stroke="#FFF7ED" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="140" y1="46" x2="151" y2="49" stroke="#FFF7ED" strokeWidth="1.2" strokeLinecap="round" />

                <line x1="126" y1="42" x2="116" y2="40" stroke="#FFF7ED" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="125" y1="44" x2="114" y2="45" stroke="#FFF7ED" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="126" y1="46" x2="117" y2="49" stroke="#FFF7ED" strokeWidth="1.2" strokeLinecap="round" />

                {/* Cat Eyes (Big, curious, emerald feline eyes with blinking motion) */}
                <motion.g
                  animate={
                    shouldReduceMotion
                      ? false
                      : {
                          scaleY: [1, 1, 0.1, 1, 1],
                        }
                  }
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    times: [0, 0.45, 0.48, 0.52, 1],
                  }}
                  style={{ transformOrigin: "131px 34px" }}
                >
                  {/* Left Eye */}
                  <ellipse cx="126" cy="34" rx="4" ry="4.5" fill="#10B981" />
                  <ellipse cx="126.5" cy="34" rx="2" ry="4" fill="#064E3B" />
                  <circle cx="125.5" cy="32.5" r="1.2" fill="#FFFFFF" />

                  {/* Right Eye */}
                  <ellipse cx="138" cy="34" rx="4" ry="4.5" fill="#10B981" />
                  <ellipse cx="138.5" cy="34" rx="2" ry="4" fill="#064E3B" />
                  <circle cx="137.5" cy="32.5" r="1.2" fill="#FFFFFF" />
                </motion.g>

                {/* Cute Tiny Inspector / Attorney Spectacles */}
                <g stroke="#38BDF8" strokeWidth="1.4" fill="url(#glassGrad)">
                  <circle cx="126" cy="34" r="5.5" />
                  <circle cx="138" cy="34" r="5.5" />
                  <line x1="131.5" y1="33" x2="132.5" y2="33" />
                  <line x1="120.5" y1="34" x2="116" y2="33" />
                </g>
              </motion.g>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Progress / Step Caption */}
      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Legal Cat Inspector actively reviewing contract coordinates</span>
      </div>
    </div>
  );
};
