import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileDown,
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { AnalysisResult, AttorneyBriefResult, SampleDocument } from "../types";
import { exportAnalysisAndBriefPdf, ExportPdfOptions } from "../utils/exportPdf";

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: SampleDocument;
  analysis: AnalysisResult | null;
  attorneyBrief: AttorneyBriefResult | null;
  onGenerateBrief?: (concerns: string) => Promise<void>;
  isGeneratingBrief?: boolean;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  document,
  analysis,
  attorneyBrief,
  onGenerateBrief,
  isGeneratingBrief = false,
}) => {
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [includeAttorneyBrief, setIncludeAttorneyBrief] = useState(true);
  const [includeObligations, setIncludeObligations] = useState(true);
  const [includeTraps, setIncludeTraps] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Short timeout to let UI update
    setTimeout(() => {
      const options: ExportPdfOptions = {
        includeAnalysis,
        includeAttorneyBrief,
        includeObligations,
        includeTraps,
      };

      const success = exportAnalysisAndBriefPdf(
        document,
        analysis,
        attorneyBrief,
        options
      );

      setIsExporting(false);
      if (success) {
        setExportSuccess(true);
        setTimeout(() => {
          setExportSuccess(false);
        }, 4000);
      }
    }, 200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickGenerateBrief = async () => {
    if (onGenerateBrief) {
      await onGenerateBrief("Prepare comprehensive consultation brief for initial review.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto no-print">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-850/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Export Print-Ready PDF Dossier
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formatted legal analysis & counsel consultation brief
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Target Document Card */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {document.category || "Legal Agreement"}
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {document.tag}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {document.title}
                </h4>
              </div>

              {analysis && (
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                      analysis.riskScore >= 65
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                        : analysis.riskScore >= 35
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                    }`}
                  >
                    {analysis.riskScore}% {analysis.overallRiskRating}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Risk Rating</p>
                </div>
              )}
            </div>

            {/* Sections Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Dossier Sections to Include
              </label>

              <div className="space-y-2.5">
                {/* Analysis & Summary */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeAnalysis}
                    onChange={(e) => setIncludeAnalysis(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Executive Summary & Risk Assessment
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Plain-English legal breakdown, grade-level simplification, and identified parties.
                    </p>
                  </div>
                </label>

                {/* Obligations & Dates */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeObligations}
                    onChange={(e) => setIncludeObligations(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      Obligations Matrix & Key Deadlines ({analysis?.obligations?.length || 0} items)
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Categorized contractual duties, responsible entities, timelines, and alert triggers.
                    </p>
                  </div>
                </label>

                {/* Hidden Traps & Gotchas */}
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={includeTraps}
                    onChange={(e) => setIncludeTraps(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      Hidden Traps & Problem Clauses ({analysis?.hiddenTrapsOrGotchas?.length || 0} alerts)
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Disadvantageous provisions, unilateral risk shifts, and mitigation recommendations.
                    </p>
                  </div>
                </label>

                {/* Attorney Brief */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-indigo-50/30 dark:bg-indigo-950/20">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAttorneyBrief}
                      onChange={(e) => setIncludeAttorneyBrief(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          Attorney Consultation Dossier & Strategic Questions
                        </span>
                        {attorneyBrief ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                            Pending Formulation
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Client objective, key legal exposures, prioritized questions for counsel, recommended redlines, and document checklist.
                      </p>
                    </div>
                  </label>

                  {/* If brief is not yet created, give a direct 1-click button to formulate it */}
                  {!attorneyBrief && onGenerateBrief && (
                    <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                        Want the full attorney consultation brief included?
                      </span>
                      <button
                        type="button"
                        onClick={handleQuickGenerateBrief}
                        disabled={isGeneratingBrief}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {isGeneratingBrief ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Formulating Brief...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Generate Brief Now
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Details & Features */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Format & Standards
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Standard A4 / Letter, Multi-page Vector PDF
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Header & Confidentiality
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Numbered Pages, Client Consultation Dossier Watermark
                </span>
              </div>
            </div>

            {exportSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  PDF document generated and downloaded successfully!
                </span>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-850/40">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto min-h-[44px] justify-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              title="Open browser print dialog for direct printing or vector PDF save"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Browser Print / PDF
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-export-pdf"
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 sm:flex-initial min-h-[44px] justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-500/20"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
