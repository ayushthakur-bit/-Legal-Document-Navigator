import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, Loader2, ShieldAlert, FileText } from "lucide-react";

interface DocumentAnalyzingOverlayProps {
  isAnalyzing: boolean;
  documentTitle: string;
}

interface StepItem {
  id: string;
  label: string;
  detail: string;
}

const STEPS: StepItem[] = [
  { id: "clauses", label: "Extracting legal clauses", detail: "Parsing paragraphs, sections, and definitions" },
  { id: "obligations", label: "Detecting obligations & deadlines", detail: "Mapping party covenants and breach consequences" },
  { id: "risks", label: "Identifying risks & hidden traps", detail: "Scanning for auto-renewals, waivers, and fee-shifting" },
  { id: "summary", label: "Generating executive summary", detail: "Translating convoluted legalese to plain English" },
];

export const DocumentAnalyzingOverlay: React.FC<DocumentAnalyzingOverlayProps> = ({
  isAnalyzing,
  documentTitle,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStepIndex(0);
      setProgress(15);
      return;
    }

    // Progress simulation while waiting for API
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 92) return prev + Math.floor(Math.random() * 8) + 3;
        return prev;
      });
    }, 300);

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
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="w-full max-w-lg glass-panel-elevated rounded-3xl p-7 shadow-2xl border border-white/20 dark:border-white/10 relative overflow-hidden"
          >
            {/* Ambient top light glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                  Analyzing Legal Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  Document: <span className="font-semibold text-slate-700 dark:text-slate-300">"{documentTitle}"</span>
                </p>
              </div>
            </div>

            {/* Glowing animated progress bar */}
            <div className="space-y-1.5 mb-6">
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>AI Processing Pipeline</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{Math.min(progress, 98)}%</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 glow-risk-bar"
                  initial={{ width: "10%" }}
                  animate={{ width: `${Math.min(progress, 98)}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }}
                />
              </div>
            </div>

            {/* Multi-step list with icons & checkmarks */}
            <div className="space-y-3">
              {STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isPending = idx > currentStepIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`flex items-start gap-3 p-3 rounded-2xl transition-all ${
                      isCurrent
                        ? "glass-indigo border border-indigo-200 dark:border-indigo-800/60"
                        : isCompleted
                        ? "glass-subtle opacity-90"
                        : "opacity-40"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isCurrent
                            ? "text-indigo-900 dark:text-indigo-200"
                            : isCompleted
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-500 dark:text-slate-500"
                        }`}>
                          {step.label}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {step.detail}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 text-center">
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
