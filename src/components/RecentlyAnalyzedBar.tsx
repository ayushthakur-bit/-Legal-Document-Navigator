import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History,
  Clock,
  Sparkles,
  CheckCircle2,
  Trash2,
  X,
  FileText,
  Receipt,
  ArrowRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { useRecentDocuments } from "../context/RecentDocumentsContext";
import { SampleDocument } from "../types";

interface RecentlyAnalyzedBarProps {
  currentDocumentId: string;
  onSelectDocument: (doc: SampleDocument) => void;
  className?: string;
}

export const RecentlyAnalyzedBar: React.FC<RecentlyAnalyzedBarProps> = ({
  currentDocumentId,
  onSelectDocument,
  className = "",
}) => {
  const {
    recentDocuments,
    removeRecentDocument,
    clearAllRecentDocuments,
    formatTimeAgo,
  } = useRecentDocuments();

  if (recentDocuments.length === 0) {
    return null;
  }

  const getRiskBadge = (score?: number, rating?: string) => {
    if (score === undefined && !rating) return null;
    const finalScore = score ?? 0;
    if (finalScore >= 70 || rating === "HIGH" || rating === "CRITICAL") {
      return (
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
          {finalScore}% Risk
        </span>
      );
    }
    if (finalScore >= 40 || rating === "MODERATE") {
      return (
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          {finalScore}% Risk
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
        {finalScore}% Safe
      </span>
    );
  };

  return (
    <div
      id="section-recently-analyzed-bar"
      className={`glass-panel rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Recently Analyzed Documents
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {recentDocuments.length} in local memory
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Instant switching cached in state &bull; No re-processing or AI delays</span>
            </p>
          </div>
        </div>

        {recentDocuments.length > 1 && (
          <button
            id="btn-clear-recent-docs"
            type="button"
            onClick={clearAllRecentDocuments}
            title="Clear all stored recent analyses from local memory"
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Document Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {recentDocuments.map((item) => {
            const isActive =
              currentDocumentId === item.id || currentDocumentId === item.document.id;
            const isInvoice =
              item.document.category === "Invoice" ||
              item.document.title.toLowerCase().includes("invoice");

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.18 }}
                className="shrink-0"
              >
                <div
                  role="button"
                  tabIndex={0}
                  id={`btn-recent-doc-${item.id}`}
                  onClick={() => onSelectDocument(item.document)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectDocument(item.document);
                    }
                  }}
                  className={`group relative pl-3 pr-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 border ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border-indigo-500"
                      : "bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
                  }`}
                >
                  <div className="shrink-0">
                    {isInvoice ? (
                      <Receipt
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-white" : "text-emerald-500"
                        }`}
                      />
                    ) : (
                      <FileText
                        className={`w-3.5 h-3.5 ${
                          isActive ? "text-white" : "text-indigo-500"
                        }`}
                      />
                    )}
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold truncate max-w-[140px] sm:max-w-[170px] leading-tight block">
                        {item.document.title}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] ${
                          isActive
                            ? "text-indigo-200"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {formatTimeAgo(item.analyzedAt)}
                      </span>
                      {item.document.category && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            isActive
                              ? "bg-indigo-700/80 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {item.document.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Risk Score Pill */}
                  {!isActive && (
                    <div className="shrink-0">
                      {getRiskBadge(
                        item.analysis?.riskScore,
                        item.analysis?.overallRiskRating
                      )}
                    </div>
                  )}

                  {/* Quick Remove X Button */}
                  <button
                    type="button"
                    title="Remove from recent cache"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentDocument(item.id);
                    }}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? "text-indigo-200 hover:text-white hover:bg-indigo-700"
                        : "text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
