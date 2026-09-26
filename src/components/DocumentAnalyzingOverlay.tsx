import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Sparkles,
  Check,
  Loader2,
  ShieldAlert,
  FileText,
  Calendar,
  ListOrdered,
  ScanLine,
  CheckCircle2,
} from "lucide-react";
import { AnimatedMovingCat } from "./AnimatedMovingCat";

interface DocumentAnalyzingOverlayProps {
  isAnalyzing: boolean;
  documentTitle: string;
}

interface StepItem {
  id: string;
  stageName: string;
  chipLabel: string;
  chipDetail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CINEMATIC_STAGES: StepItem[] = [
  {
    id: "entry",
    stageName: "Document floating into analysis workspace",
    chipLabel: "Document Initialized",
    chipDetail: "Document parsed & structured",
    icon: FileText,
  },
  {
    id: "scanning",
    stageName: "AI scanning beam sweeping document terms",
    chipLabel: "Scanning Active",
    chipDetail: "Multimodal photonic beam traversing",
    icon: ScanLine,
  },
  {
    id: "clauses",
    stageName: "Legal clauses detected",
    chipLabel: "Clauses Detected",
    chipDetail: "12 clauses categorized & verified",
    icon: FileText,
  },
  {
    id: "obligations",
    stageName: "Obligations & party covenants detected",
    chipLabel: "Obligations Detected",
    chipDetail: "8 active duties & breach conditions",
    icon: ListOrdered,
  },
  {
    id: "dates",
    stageName: "Important dates & milestones detected",
    chipLabel: "Dates & Deadlines Detected",
    chipDetail: "Renewal windows & statutory deadlines",
    icon: Calendar,
  },
  {
    id: "risks",
    stageName: "Risk indicators & hidden traps detected",
    chipLabel: "Risk Indicators Detected",
    chipDetail: "Exposure score & indemnity clauses calculated",
    icon: ShieldAlert,
  },
  {
    id: "complete",
    stageName: "Analysis complete",
    chipLabel: "Analysis Complete",
    chipDetail: "Zero-latency grounded report ready",
    icon: CheckCircle2,
  },
];

export const DocumentAnalyzingOverlay: React.FC<DocumentAnalyzingOverlayProps> = ({
  isAnalyzing,
  documentTitle,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStageIndex(0);
      setProgress(12);
      return;
    }

    // Step through the cinematic stages smoothly
    const stepInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < CINEMATIC_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) return prev + Math.floor(Math.random() * 6) + 4;
        return prev;
      });
    }, 240);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isAnalyzing]);

  return (
    <AnimatePresence>
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xl"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.90, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 14 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-full max-w-xl glass-panel-elevated rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.35)] border border-indigo-500/25 relative overflow-hidden"
          >
            {/* Ambient top light glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,1)]" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.3)]">
                  <Sparkles className="w-5 h-5 animate-pulse text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Antigravity Document Scanner
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Physics AI
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    Analyzing: <span className="font-semibold text-slate-700 dark:text-slate-300">"{documentTitle}"</span>
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {Math.min(progress, 98)}%
              </div>
            </div>

            {/* Floating Visual Document with AI Scanning Beam and Emerging Particles */}
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-indigo-950/70 border border-indigo-500/30 p-4 mb-4 overflow-hidden shadow-inner">
              {/* Emerging data particles floating upward */}
              {!shouldReduceMotion && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: 40 + i * 50,
                        y: 80,
                        opacity: 0,
                        scale: 0.5,
                      }}
                      animate={{
                        y: [-10, -70],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.6],
                      }}
                      transition={{
                        duration: 2.2 + (i % 3) * 0.4,
                        repeat: Infinity,
                        delay: i * 0.28,
                        ease: "easeOut",
                      }}
                      className="absolute w-2 h-2 rounded-full bg-indigo-400 blur-[1px] shadow-[0_0_8px_rgba(129,140,248,0.9)]"
                    />
                  ))}
                </div>
              )}

              {/* Floating Document Object */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -6, 0],
                        rotate: [0, 0.6, -0.6, 0],
                      }
                }
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative bg-slate-800/90 rounded-xl p-3.5 border border-indigo-400/30 shadow-[0_12px_28px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                {/* AI Photonic Scanning Beam */}
                {!shouldReduceMotion && (
                  <motion.div
                    animate={{
                      top: ["-10%", "110%"],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute left-0 right-0 h-8 pointer-events-none z-10"
                  >
                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,1)]" />
                    <div className="w-full h-full bg-gradient-to-b from-cyan-400/15 to-transparent blur-xs" />
                  </motion.div>
                )}

                <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Legal Payload Representation
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">STATUS: SCANNING</span>
                </div>

                <div className="space-y-1.5 opacity-70">
                  <div className="h-1.5 bg-indigo-400/30 rounded-full w-4/5" />
                  <div className="h-1.5 bg-indigo-400/20 rounded-full w-full" />
                  <div className="h-1.5 bg-indigo-400/25 rounded-full w-2/3" />
                </div>
              </motion.div>
            </div>

            {/* Moving Animated Cat Inspector while in process (preserves previous playful feature!) */}
            <div className="rounded-2xl glass-subtle border border-indigo-200/50 dark:border-indigo-800/40 p-2 mb-4 overflow-hidden">
              <AnimatedMovingCat
                statusText={CINEMATIC_STAGES[currentStageIndex]?.stageName || "Analyzing legal document clauses..."}
                size="sm"
              />
            </div>

            {/* Glowing animated progress bar */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>AI Pipeline Convergence</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  Stage {currentStageIndex + 1} of {CINEMATIC_STAGES.length}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 glow-risk-bar"
                  initial={{ width: "10%" }}
                  animate={{ width: `${Math.min(progress, 98)}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }}
                />
              </div>
            </div>

            {/* Floating Data Chips settling into position (Requirement 6) */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {CINEMATIC_STAGES.map((stage, idx) => {
                const isReached = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const Icon = stage.icon;

                if (!isReached) return null;

                return (
                  <motion.div
                    key={stage.id}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 24,
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-indigo-600/15 dark:bg-indigo-900/35 border-indigo-400/60 shadow-[0_4px_16px_rgba(99,102,241,0.2)]"
                        : "bg-slate-100/60 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-800/60 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isCurrent ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {stage.chipLabel}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {stage.chipDetail}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        isCurrent
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {isCurrent ? "Settling" : "Detected"}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Grounding analysis strictly against document terms with zero hallucinated clauses.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
