import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  FileCheck,
  Zap,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Info,
  ChevronRight,
  Eye,
  Sliders,
  UploadCloud,
  FileDown,
  RotateCcw,
} from "lucide-react";
import { AnalysisResult, ChecklistItem, HiddenTrap, SampleDocument, RiskFactorItem } from "../types";
import { RecentlyAnalyzedBar } from "./RecentlyAnalyzedBar";
import { SAMPLE_DOCUMENTS } from "../data/sampleDocuments";
import { LegalDocumentSplitNavigator } from "./LegalDocumentSplitNavigator";
import {
  getRiskColorInfo,
  deriveDynamicRiskFactors,
  calculateChecklistProgress,
} from "../utils/riskEngine";

interface DashboardViewProps {
  analysis: AnalysisResult | null;
  documentTitle: string;
  documentText?: string;
  currentDocumentId?: string;
  onSelectDocument?: (doc: SampleDocument) => void;
  onNavigateToTab: (tab: "overview" | "upload" | "clauses" | "obligations" | "compare" | "chat" | "voice" | "attorney-prep") => void;
  onSelectClauseTopic?: (topic: string) => void;
  onOpenGlossary: () => void;
  onOpenExportModal?: () => void;
  onOpenUploadModal?: () => void;
  onResetAnalysis?: () => void;
  onAskQuestion?: (q: string, includeGoogleSearch?: boolean) => Promise<any>;
  isAnalyzing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analysis,
  documentTitle,
  documentText,
  currentDocumentId,
  onSelectDocument,
  onNavigateToTab,
  onSelectClauseTopic,
  onOpenGlossary,
  onOpenExportModal,
  onOpenUploadModal,
  onResetAnalysis,
  onAskQuestion,
  isAnalyzing,
}) => {
  const [isReset, setIsReset] = useState(false);

  // Sync state if a new document or analysis arrives
  useEffect(() => {
    setIsReset(false);
  }, [analysis, documentTitle]);

  const activeAnalysis = isReset ? null : analysis;

  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    activeAnalysis?.preSigningChecklist || []
  );
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showRiskBreakdown, setShowRiskBreakdown] = useState(false);
  const [selectedTrapModal, setSelectedTrapModal] = useState<HiddenTrap | null>(null);

  // Reset document risk analysis action
  const handleResetAnalysis = () => {
    setIsReset(true);
    setAnimatedScore(0);
    setShowRiskBreakdown(false);
    setSelectedTrapModal(null);
    onResetAnalysis?.();
  };

  // Sync checklist if activeAnalysis changes
  useEffect(() => {
    if (activeAnalysis?.preSigningChecklist) {
      setChecklist(activeAnalysis.preSigningChecklist);
    } else {
      setChecklist([]);
    }
  }, [activeAnalysis]);

  // Animate count-up 0 -> score on mount or when activeAnalysis changes
  useEffect(() => {
    if (!activeAnalysis) {
      setAnimatedScore(0);
      return;
    }
    const target = activeAnalysis.riskScore || 0;
    setAnimatedScore(0);
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(ease * target);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const animId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animId);
  }, [activeAnalysis?.riskScore]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Dynamically derive explainable risk factor weights based on the actual document analysis
  const dynamicRiskFactors: RiskFactorItem[] = useMemo(() => {
    return deriveDynamicRiskFactors(activeAnalysis);
  }, [activeAnalysis]);

  const riskColor = activeAnalysis
    ? getRiskColorInfo(activeAnalysis.riskScore)
    : {
        badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        bar: "from-amber-500 to-amber-600",
        label: "PENDING UPLOAD",
        text: "text-amber-600 dark:text-amber-400",
        bgSubtle: "bg-amber-50 dark:bg-amber-950/40",
        borderSubtle: "border-amber-200 dark:border-amber-800",
      };

  const completedChecklistCount = checklist.filter((i) => i.completed).length;

  // Stagger animation container
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // If actively analyzing a newly uploaded document, display progress banner
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 animate-spin shadow-md border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-2 font-display">
          Analyzing Document Risk &amp; Contractual Terms...
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Synthesizing key clauses, calculating accurate exposure ratings, and identifying hidden gotchas.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Quick Intake & Auto-Detection Banner */}
      <motion.div
        variants={itemVariants}
        className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-white/40 to-indigo-50/20 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-indigo-950/20 shadow-xs"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Upload New Document with AI Auto-Detection
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                New
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Drag &amp; drop any contract, lease, or agreement. The intake engine automatically identifies the document type, contracting parties, and governing jurisdiction.
            </p>
          </div>
        </div>

        <button
          id="btn-goto-upload-detect"
          onClick={() => onNavigateToTab("upload")}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Open Detection Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Recently Analyzed Documents Switcher Bar */}
      <motion.div variants={itemVariants}>
        <RecentlyAnalyzedBar
          currentDocumentId={currentDocumentId || ""}
          onSelectDocument={onSelectDocument || (() => {})}
        />
      </motion.div>

      {/* CORE LEGAL DOCUMENT NAVIGATOR: SPLIT VIEW (DOCUMENT on left, AI ANALYSIS on right) */}
      <motion.div variants={itemVariants}>
        <LegalDocumentSplitNavigator
          documentTitle={documentTitle}
          documentText={documentText || ""}
          analysis={activeAnalysis}
          onNavigateToTab={onNavigateToTab}
          onSelectClauseTopic={onSelectClauseTopic}
          onAskQuestion={onAskQuestion}
        />
      </motion.div>

      {/* 1. HERO SECTION: Document Risk Analysis & Reading Accessibility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* DOCUMENT RISK ANALYSIS SECTION */}
        <motion.div
          variants={itemVariants}
          id="section-document-risk-analysis"
          role="region"
          aria-label="Document Risk Analysis Overview"
          className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl group"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldAlert className={`w-4 h-4 ${activeAnalysis ? "text-rose-500" : "text-amber-500"}`} />
              Document Risk Analysis
            </span>
            <div className="flex items-center gap-2">
              {activeAnalysis && (
                <button
                  type="button"
                  id="btn-reset-risk-analysis"
                  onClick={handleResetAnalysis}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 glass-subtle hover:bg-rose-50/80 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                  title="Reset and clear document risk analysis"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  activeAnalysis
                    ? riskColor.badge
                    : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                }`}
              >
                {activeAnalysis ? riskColor.label : "First upload document"}
              </span>
            </div>
          </div>

          {!activeAnalysis ? (
            /* EMPTY STATE: First upload document callout */
            <div className="py-6 px-2 sm:px-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/15 via-indigo-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-indigo-500/10 border border-amber-200/80 dark:border-amber-700/60 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-2">
                First upload document
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mb-5 leading-relaxed">
                Please upload or select a legal document first. The Legal Risk Engine will automatically calculate exposure ratings (0–100), identify predatory traps, and generate an itemized breakdown of weighted risk factors.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
                <button
                  id="btn-risk-first-upload"
                  type="button"
                  onClick={() => onNavigateToTab("upload")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document Now</span>
                </button>
              </div>

              {/* Sample Document Quick Selection */}
              <div className="w-full pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2.5 block">
                  Or test risk analysis with a preloaded sample agreement:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SAMPLE_DOCUMENTS.map((doc) => (
                    <button
                      key={doc.id}
                      id={`btn-sample-risk-${doc.id}`}
                      type="button"
                      onClick={() => onSelectDocument && onSelectDocument(doc)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium glass-subtle hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer"
                    >
                      {doc.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE STATE: Dynamically Computed Risk Score & Factors */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-2">
                {/* Left: Interactive Score Number with dynamic breakdown popover */}
                <div
                  className="sm:col-span-5 relative"
                  role="button"
                  tabIndex={0}
                  aria-expanded={showRiskBreakdown}
                  aria-controls="risk-breakdown-details"
                  aria-label={`Document risk score ${animatedScore} out of 100. Press Enter or Space to toggle risk factor breakdown.`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setShowRiskBreakdown((prev) => !prev);
                    }
                  }}
                  onMouseEnter={() => setShowRiskBreakdown(true)}
                  onMouseLeave={() => setShowRiskBreakdown(false)}
                  onClick={() => setShowRiskBreakdown((prev) => !prev)}
                >
                  <div
                    className="flex items-baseline gap-2 cursor-pointer select-none"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span className="text-6xl sm:text-7xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                      {animatedScore}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg sm:text-xl font-bold text-slate-400 dark:text-slate-500">/ 100</span>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        Explain score <Info className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Hover Explainability Popover with dynamic factors */}
                  <AnimatePresence>
                    {showRiskBreakdown && (
                      <motion.div
                        id="risk-breakdown-details"
                        role="dialog"
                        aria-label="Document Risk Factors Breakdown"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-3 w-72 sm:w-84 glass-panel-elevated rounded-2xl p-4 shadow-2xl border border-slate-200/90 dark:border-slate-700 z-30"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Document Risk Factors
                          </span>
                          <span className="text-[10px] font-mono text-rose-500 font-bold">
                            Score: {analysis.riskScore}/100 pts
                          </span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs mt-1 max-h-60 overflow-y-auto pr-1">
                          {dynamicRiskFactors.map((f, i) => (
                            <div key={i} className="py-2 flex items-start justify-between gap-2">
                              <div>
                                <div className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                                  {f.name}
                                </div>
                                {f.rationale && (
                                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                                    {f.rationale}
                                  </div>
                                )}
                              </div>
                              <span
                                className={`font-mono font-bold shrink-0 text-xs px-1.5 py-0.5 rounded ${
                                  f.severity === "CRITICAL"
                                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50"
                                    : f.severity === "HIGH"
                                    ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
                                    : "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                                }`}
                              >
                                {f.points}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                          Calibrated for this document's liabilities, penalties, termination traps, and jurisdictional exposure.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right: Progress bar & AI Summary statement */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="w-full bg-slate-200/70 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 relative shadow-inner">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${riskColor.bar} ${analysis.riskScore > 65 ? "glow-risk-bar" : ""}`}
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min(activeAnalysis.riskScore, 100)}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">✦ AI Assessment:</span>
                    {activeAnalysis.riskSummary}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Detected Gotchas:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md glass-rose">
                    {activeAnalysis.hiddenTrapsOrGotchas.length} Unfavorable Traps
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    id="btn-reset-risk-analysis-bottom"
                    onClick={handleResetAnalysis}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 glass-subtle hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer"
                    title="Reset document risk analysis to initial state"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Analysis</span>
                  </button>

                  {onOpenExportModal && (
                    <button
                      type="button"
                      id="btn-dashboard-export-pdf"
                      onClick={onOpenExportModal}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 glass-subtle hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      title="Export full analysis and attorney brief to print-ready PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Export PDF</span>
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateToTab("clauses")}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-transform hover:translate-x-1"
                  >
                    Inspect all clauses <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* READING ACCESSIBILITY VISUAL GAUGE */}
        <motion.div
          variants={itemVariants}
          className="glass-panel rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-indigo-500" />
                Reading Difficulty
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full glass-indigo text-indigo-600 dark:text-indigo-300">
                {activeAnalysis ? "AI Simplification" : "Pending Upload"}
              </span>
            </div>

            {activeAnalysis ? (
              <>
                <div className="my-3 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400">Easy (Grade 6)</span>
                    <span className="text-rose-500">Complex (Grade 16+)</span>
                  </div>
                  <div className="relative w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500">
                    <motion.div
                      initial={{ left: "0%" }}
                      animate={{ left: "86%" }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="absolute -top-1.5 -translate-x-1/2 flex flex-col items-center"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-2 border-rose-500 shadow-md flex items-center justify-center text-[9px] font-bold font-mono">
                        ●
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-2xl glass-subtle flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Original Legalese</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Grade 16+ (Post-Grad)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700/60 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-rose-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "90%" }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl glass-emerald flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-800 dark:text-emerald-300 font-medium">AI Simplified</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Grade 8 (Everyday English)</span>
                    </div>
                    <div className="w-full bg-emerald-200/60 dark:bg-emerald-950/60 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "42%" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-1">
                  Readability &amp; Grade Level
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Upload a document to evaluate sentence length, passive voice density, and dual-tone simplification.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
            <button
              onClick={onOpenGlossary}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Legal Glossary {activeAnalysis ? `(${activeAnalysis.legalGlossary.length})` : ""}
            </button>
            <span className="text-[11px] text-slate-400">
              {activeAnalysis ? "Readability -54%" : "Awaiting input"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* DOCUMENT SUMMARY & ANALYSIS SECTIONS OR EMPTY PREVIEW */}
      {!activeAnalysis ? (
        /* Empty Preview Card */
        <motion.div
          variants={itemVariants}
          className="glass-panel rounded-3xl p-6 sm:p-8 text-center border border-indigo-200/60 dark:border-indigo-900/60 bg-gradient-to-b from-white/60 to-slate-50/40 dark:from-slate-900/60 dark:to-slate-950/40 shadow-sm"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              Document Analysis Engine Ready
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
              Upload Any Agreement to Unlock Full Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Once uploaded, our specialized legal AI pipeline extracts critical deadlines, flags predatory gotchas, compiles an executive brief, and prepares an attorney consultation dossier.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="p-3.5 rounded-2xl glass-subtle border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-rose-500 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Predatory Traps</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Detects auto-renewals, unilateral fees, and hidden indemnity clauses.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl glass-subtle border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-indigo-500 font-bold text-xs">
                  <FileCheck className="w-4 h-4" />
                  <span>Executive Brief</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Plain-English translation of rights, responsibilities, and commercial terms.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl glass-subtle border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-emerald-500 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pre-Signing Checklist</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Actionable verification steps before signing or transferring funds.
                </p>
              </div>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => onNavigateToTab("upload")}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Upload Document Now
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Full Document Breakdown when Document is Loaded */
        <>
          {/* 2. POTENTIAL RED FLAGS / IDENTIFIED TRAPS AS INTERACTIVE CARDS */}
          <motion.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    Potential Red Flags
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      {activeAnalysis.hiddenTrapsOrGotchas.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hidden traps, strict deadlines, and one-sided clauses that require negotiation or legal caution
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab("clauses")}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hidden sm:flex items-center gap-1 cursor-pointer"
              >
                View all clauses <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Cards Grid with hover lift & accent border */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAnalysis.hiddenTrapsOrGotchas.map((trap, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedTrapModal(trap)}
                  role="button"
                  tabIndex={0}
                  aria-haspopup="dialog"
                  aria-label={`View legal protection strategy for trap: ${trap.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedTrapModal(trap);
                    }
                  }}
                  className="glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/80 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 group-hover:scale-125 transition-transform" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {trap.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 shrink-0">
                        High-impact
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {trap.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Protection Strategy</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 3. PLAIN-ENGLISH EXECUTIVE SUMMARY & CRITICAL DEADLINES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Executive Summary (2 cols) */}
            <motion.section variants={itemVariants} className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                      Plain-English Executive Summary
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Core provisions, party relationships, and commercial purpose translated into everyday terms
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToTab("chat")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 glass-subtle hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  Ask a question
                </button>
              </div>

              <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed space-y-3 font-normal">
                {activeAnalysis.summary.split("\n\n").map((para, i) => (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Identified Parties */}
              {activeAnalysis.keyParties && activeAnalysis.keyParties.length > 0 && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Identified Parties:</span>
                  {activeAnalysis.keyParties.map((party, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg glass-subtle text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {party}
                    </span>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Deadlines & Critical Events (1 col) */}
            <motion.section variants={itemVariants} className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Key Deadlines &amp; Timelines
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeAnalysis.keyDatesAndDeadlines.length} scheduled triggers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                  {activeAnalysis.keyDatesAndDeadlines.map((date, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl glass-subtle hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {date.event}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md shrink-0">
                          {date.timeframe}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                        {date.actionRequired}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                <button
                  onClick={() => onNavigateToTab("obligations")}
                  className="w-full py-2 text-xs font-bold text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl glass-subtle hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Full Obligations Matrix &rarr;
                </button>
              </div>
            </motion.section>
          </div>

          {/* 4. PRE-SIGNING SAFETY CHECKLIST */}
          <motion.section variants={itemVariants} className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    Pre-Signing Safety Checklist
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actionable verifications before signing, agreeing, or paying deposits
                  </p>
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completedChecklistCount}</span> of{" "}
                {checklist.length} verified
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="group" aria-label="Pre-signing verification items">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={Boolean(item.completed)}
                  aria-label={`${item.item} - Priority ${item.importance} - ${item.completed ? "Verified" : "Pending"}`}
                  onClick={() => toggleChecklistItem(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleChecklistItem(item.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    item.completed
                      ? "glass-subtle opacity-60 line-through border-slate-200/40 dark:border-slate-800"
                      : "glass-subtle border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(item.completed)}
                      onChange={() => toggleChecklistItem(item.id)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-200">
                      {item.item}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      item.importance === "CRITICAL"
                        ? "glass-rose text-rose-700 dark:text-rose-400"
                        : "glass-subtle text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.importance}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={() => onNavigateToTab("attorney-prep")}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                Generate Attorney Consultation Dossier with these points &rarr;
              </button>
              <button
                onClick={() => onNavigateToTab("compare")}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
              >
                Compare against another version &rarr;
              </button>
            </div>
          </motion.section>
        </>
      )}

      {/* DETAIL MODAL FOR RED FLAG (Req 5) */}
      <AnimatePresence>
        {selectedTrapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-lg glass-panel-elevated rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {selectedTrapModal.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      High Impact Risk Clause
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTrapModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Why this is risky:
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedTrapModal.description}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Recommended Mitigation or Counter-Proposal:
                </h4>
                <p className="text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed font-medium">
                  {selectedTrapModal.mitigationOrQuestion}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedTrapModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedTrapModal(null);
                    onNavigateToTab("clauses");
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                >
                  View in Clauses Tab &rarr;
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
