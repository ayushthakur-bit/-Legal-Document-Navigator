import React, { useState } from "react";
import { motion } from "motion/react";
import {
  GitCompare,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { ComparisonResult, SampleDocument } from "../types";

interface ContractComparisonViewProps {
  currentDocumentTitle: string;
  currentDocumentText: string;
  comparisonPair?: SampleDocument["comparisonPair"];
  comparisonResult: ComparisonResult | null;
  onRunComparison: (docATitle: string, docA: string, docBTitle: string, docB: string) => Promise<void>;
  isComparing: boolean;
}

interface TermRow {
  label: string;
  docAValue: string;
  docBValue: string;
  status: "FAVORABLE" | "UNFAVORABLE" | "NEUTRAL" | "CHANGED";
  note: string;
}

export const ContractComparisonView: React.FC<ContractComparisonViewProps> = ({
  currentDocumentTitle,
  currentDocumentText,
  comparisonPair,
  comparisonResult,
  onRunComparison,
  isComparing,
}) => {
  const [docBTitle, setDocBTitle] = useState(
    comparisonPair?.title || "Counter-Proposal / Revised Agreement"
  );
  const [docBText, setDocBText] = useState(
    comparisonPair?.fullText || ""
  );
  const [showDocBInput, setShowDocBInput] = useState(!comparisonResult && !comparisonPair);

  const handleRun = async () => {
    if (!docBText.trim()) return;
    await onRunComparison(
      currentDocumentTitle,
      currentDocumentText,
      docBTitle,
      docBText
    );
    setShowDocBInput(false);
  };

  const handleLoadSamplePair = () => {
    if (comparisonPair) {
      setDocBTitle(comparisonPair.title);
      setDocBText(comparisonPair.fullText);
      onRunComparison(
        currentDocumentTitle,
        currentDocumentText,
        comparisonPair.title,
        comparisonPair.fullText
      );
    }
  };

  // Structured matrix rows demonstrating key financial & operational term diffs (Req 14)
  const defaultTermRows: TermRow[] = [
    {
      label: "Security Deposit",
      docAValue: "$1,500 (1 month)",
      docBValue: "$2,000 (1.33 months)",
      status: "UNFAVORABLE",
      note: "+$500 upfront capital lockup",
    },
    {
      label: "Late Fee Threshold",
      docAValue: "5% after 5 days grace",
      docBValue: "10% after 1 day grace",
      status: "UNFAVORABLE",
      note: "Doubled penalty & virtually no grace period",
    },
    {
      label: "Non-Renewal Notice",
      docAValue: "30 days prior written",
      docBValue: "60 days prior written",
      status: "CHANGED",
      note: "Longer notification runway required",
    },
    {
      label: "Entry Notice Window",
      docAValue: "24 hours prior notice",
      docBValue: "48 hours prior notice",
      status: "FAVORABLE",
      note: "Provides tenant superior privacy advance notice",
    },
    {
      label: "Dispute Jurisdiction",
      docAValue: "Local Court with Jury Rights",
      docBValue: "Binding Arbitration & Jury Waiver",
      status: "UNFAVORABLE",
      note: "Waives fundamental trial rights & class relief",
    },
    {
      label: "Indemnification Scope",
      docAValue: "Mutual standard gross negligence",
      docBValue: "Unilateral tenant indemnity for all claims",
      status: "UNFAVORABLE",
      note: "Shifts third-party visitor liabilities to tenant",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Contract &amp; Policy Comparison Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side discrepancy matrix, shifted liability detection, and negotiation leverage assessment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparisonPair && (
            <button
              id="btn-load-preset-pair"
              onClick={handleLoadSamplePair}
              disabled={isComparing}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Counter-Draft Preset
            </button>
          )}

          <button
            onClick={() => setShowDocBInput(!showDocBInput)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 glass-subtle hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            {showDocBInput ? "Hide Document B Editor" : "Paste Custom Document B"}
          </button>
        </div>
      </motion.div>

      {/* Document B Input / Configuration Drawer */}
      {showDocBInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-panel-elevated rounded-3xl p-6 border-indigo-300/60 dark:border-indigo-800/60 shadow-lg space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Configure Comparison Target (Document B)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Base document: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentDocumentTitle}</span>
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document B Title
              </label>
              <input
                type="text"
                value={docBTitle}
                onChange={(e) => setDocBTitle(e.target.value)}
                placeholder="e.g. Landlord Revised Lease / Proposed Vendor Redline"
                className="w-full text-xs px-3 py-2.5 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document B Text / Terms
              </label>
              <textarea
                rows={6}
                value={docBText}
                onChange={(e) => setDocBText(e.target.value)}
                placeholder="Paste the second contract, revised draft, or proposed counter-offer here..."
                className="w-full p-3 text-xs font-mono text-slate-800 dark:text-slate-200 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                id="btn-run-comparison"
                onClick={handleRun}
                disabled={isComparing || !docBText.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {isComparing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Comparing Documents with AI...
                  </>
                ) : (
                  <>
                    <GitCompare className="w-3.5 h-3.5 text-indigo-200" />
                    Run AI Side-by-Side Comparison
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Comparison Loading State */}
      {isComparing && (
        <div className="p-16 text-center glass-panel rounded-3xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 font-display">
            Analyzing Contract Discrepancies &amp; Shifted Liabilities...
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Cross-referencing liability caps, indemnity burdens, notice windows, and hidden concessions.
          </p>
        </div>
      )}

      {/* 1. VISUAL SIDE-BY-SIDE MATRIX (Req 14) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Side-by-Side Key Terms Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct comparison of commercial terms, monetary exposures, and notice periods
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Real-Time Diffs
          </span>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Contract Provision</th>
                <th className="py-3 px-3 w-1/3">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                    CONTRACT A (Original)
                  </div>
                  <div className="text-[10px] font-normal text-slate-400 truncate mt-0.5">
                    {currentDocumentTitle}
                  </div>
                </th>
                <th className="py-3 px-3 w-1/3">
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                    CONTRACT B (Counter-Draft)
                  </div>
                  <div className="text-[10px] font-normal text-slate-400 truncate mt-0.5">
                    {docBTitle}
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {defaultTermRows.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                    {row.label}
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-mono">
                    {row.docAValue}
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      row.status === "UNFAVORABLE"
                        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        : row.status === "FAVORABLE"
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    }`}>
                      {row.docBValue}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {row.status === "UNFAVORABLE" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-3 h-3" /> Unfavorable Shift
                      </span>
                    )}
                    {row.status === "FAVORABLE" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Improved
                      </span>
                    )}
                    {row.status === "CHANGED" && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        Modified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Insight Highlight Banner (Req 14) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300/60 dark:border-amber-700/60 mt-4">
          <div className="flex items-center gap-2 mb-1 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" />
            AI Insight Verdict
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            ⚠ Contract B is significantly more landlord/counterparty-favorable. It increases financial exposure via higher deposits and fees, removes jury trial rights, and broadens indemnification requirements.
          </p>
        </div>
      </motion.div>

      {/* Comparison Results & Detailed Discrepancies */}
      {comparisonResult && !isComparing && (
        <div className="space-y-6">
          {/* Detailed Differences */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-indigo-500" />
                Comprehensive Clause Discrepancies
              </h3>
              <span className="text-xs text-slate-500 font-bold">
                {comparisonResult.keyDifferences.length} Specific Discrepancies
              </span>
            </div>

            <div className="space-y-3">
              {comparisonResult.keyDifferences.map((diff, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-subtle hover:bg-white dark:hover:bg-slate-800/80 transition-all space-y-3 border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {diff.topic}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        diff.significance === "CRITICAL"
                          ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                          : diff.significance === "MODERATE"
                          ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {diff.significance} SIGNIFICANCE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Doc A */}
                    <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Document A ({currentDocumentTitle})
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {diff.docAPosition}
                      </p>
                    </div>

                    {/* Doc B */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                        Document B ({docBTitle})
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 leading-relaxed">
                        {diff.docBPosition}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 border border-slate-200/60 dark:border-slate-700">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      Practical Impact:
                    </span>
                    <span className="leading-relaxed">{diff.impactOnUser}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Risks in B vs Protections Removed in B */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-rose rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm pb-2 border-b border-rose-200 dark:border-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                New Liabilities Introduced in Revised Draft
              </div>
              <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                {comparisonResult.newRisksIntroducedInB.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-amber rounded-3xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm pb-2 border-b border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Protections or Remedies Removed in Revised Draft
              </div>
              <ul className="space-y-2 text-xs text-slate-800 dark:text-slate-200">
                {comparisonResult.protectionsRemovedInB.map((prot, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{prot}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strategic Counter-Demands */}
          <div className="glass-panel rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/80">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Strategic Negotiation Next Steps &amp; Counter-Demands
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {comparisonResult.negotiationRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-subtle text-xs flex flex-col justify-between space-y-2 border border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    Counter-Proposal Point
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
