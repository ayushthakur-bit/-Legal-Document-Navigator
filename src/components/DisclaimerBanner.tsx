import React, { useState } from "react";
import { AlertTriangle, Info, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const DisclaimerBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {!isDismissed && (
        <aside
          id="legal-disclaimer-banner"
          aria-label="Educational Legal Assistance Notice"
          className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-between transition-all relative z-20"
        >
          <div className="flex items-center gap-2 max-w-6xl mx-auto flex-1 flex-wrap">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold text-amber-950 dark:text-amber-100">Educational Legal Assistance:</span>
            <span className="text-amber-900/90 dark:text-amber-200/90">
              This AI assistant simplifies, analyzes, and compares documents to empower understanding. It provides informational analysis, not formal legal advice.
            </span>
            <button
              id="btn-learn-more-disclaimer"
              onClick={() => setShowModal(true)}
              className="text-amber-950 dark:text-amber-100 font-bold underline hover:text-black dark:hover:text-white ml-1 cursor-pointer whitespace-nowrap"
            >
              Notice &amp; Boundaries
            </button>
          </div>
          <button
            id="btn-dismiss-disclaimer"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss disclaimer"
            className="text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      <AnimatePresence>
        {showModal && (
          <div
            id="legal-notice-modal-backdrop"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              id="legal-notice-modal-dialog"
              className="glass-panel-elevated rounded-3xl border border-slate-200 dark:border-slate-700 max-w-xl w-full p-6 text-slate-800 dark:text-slate-200 space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-base sm:text-lg font-display text-slate-900 dark:text-white">
                    Legal Information &amp; Responsibility Notice
                  </h3>
                </div>
                <button
                  id="btn-close-notice-modal"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs sm:text-sm space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                <p>
                  <strong className="text-slate-900 dark:text-white">Information, Not Legal Representation:</strong> This application is powered by generative artificial intelligence to make complex legal language accessible, highlight potential risks, compare clauses, and generate organizational tools like checklists and consultation dossiers.
                </p>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    Key Operating Principles:
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>No attorney-client relationship is formed through the use of this software.</li>
                    <li>Legal outcomes depend heavily on local jurisdiction, statutory changes, and case law that may not be captured in contract text alone.</li>
                    <li>Before signing binding agreements or making legal decisions, consult a qualified attorney licensed in your relevant jurisdiction.</li>
                  </ul>
                </div>
                <p>
                  <strong className="text-slate-900 dark:text-white">How to use this tool effectively:</strong>
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Understand your commitments:</strong> Identify what you are promising and what the other party is promising.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Uncover asymmetric risk:</strong> Spot one-sided indemnification, aggressive auto-renewals, or surprise fee shifts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Maximize legal professional value:</strong> Use the generated Attorney Consultation Dossier to ask precise questions and minimize billable hours.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
                <button
                  id="btn-acknowledge-notice"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  I Understand &amp; Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
