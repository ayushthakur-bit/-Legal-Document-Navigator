import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { LegalClause, RiskLevel } from "../types";

interface ClauseNavigatorViewProps {
  clauses: LegalClause[];
  fullDocumentText: string;
  onAskAboutClause: (clauseSnippet: string, clauseTitle: string) => void;
  onOpenGlossary: () => void;
}

export const ClauseNavigatorView: React.FC<ClauseNavigatorViewProps> = ({
  clauses,
  fullDocumentText,
  onAskAboutClause,
  onOpenGlossary,
}) => {
  const [selectedClauseIndex, setSelectedClauseIndex] = useState<number>(0);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = Array.from(
    new Set(clauses.map((c) => c.category).filter(Boolean))
  );

  const filteredClauses = clauses.filter((c) => {
    const matchesRisk =
      filterRisk === "ALL" || c.riskLevel.toUpperCase() === filterRisk;
    const matchesCategory =
      filterCategory === "ALL" || c.category === filterCategory;
    const matchesSearch =
      !searchQuery ||
      c.clauseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.originalSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesCategory && matchesSearch;
  });

  const activeClause =
    filteredClauses[selectedClauseIndex] || filteredClauses[0] || clauses[0];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level?.toUpperCase()) {
      case "CRITICAL":
        return {
          badge: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900",
          border: "border-l-rose-500",
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500" />,
        };
      case "CAUTION":
        return {
          badge: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900",
          border: "border-l-amber-500",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
        };
      case "SAFE":
      default:
        return {
          badge: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900",
          border: "border-l-emerald-500",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clauses, terms, or covenants..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedClauseIndex(0);
            }}
            className="w-full text-xs pl-10 pr-3 py-2.5 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filter by Risk */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 font-medium">Risk:</span>
          {(["ALL", "CRITICAL", "CAUTION", "SAFE"] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                setFilterRisk(r);
                setSelectedClauseIndex(0);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer text-xs ${
                filterRisk === r
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "glass-subtle text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Filter by Category */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Topic:</span>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setSelectedClauseIndex(0);
              }}
              className="text-xs px-3 py-2 glass-subtle rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Topics</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Dual Pane Layout: Clauses List on Left, Deep Plain English Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Clause Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1 no-scrollbar">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
            Identified Clauses ({filteredClauses.length})
          </div>

          {filteredClauses.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-3xl text-slate-500 text-xs">
              No clauses matched the selected filters.
            </div>
          ) : (
            filteredClauses.map((clause, idx) => {
              const riskMeta = getRiskColor(clause.riskLevel);
              const isSelected = activeClause === clause;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedClauseIndex(idx)}
                  className={`p-4 rounded-2xl transition-all cursor-pointer border-l-4 ${
                    riskMeta.border
                  } ${
                    isSelected
                      ? "glass-panel-elevated border-indigo-400 dark:border-indigo-500 shadow-md ring-1 ring-indigo-400/30"
                      : "glass-panel hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {clause.clauseTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${riskMeta.badge}`}
                    >
                      {riskMeta.icon}
                      {clause.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {clause.plainEnglish}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="glass-subtle text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700/60">
                      {clause.category}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {isSelected ? "Active View →" : "Inspect →"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Deep Plain English Translator & Impact (7 cols) */}
        <div className="lg:col-span-7">
          {activeClause ? (
            <div className="glass-panel-elevated rounded-3xl p-6 space-y-5 sticky top-24 border border-slate-200/80 dark:border-slate-800 shadow-xl">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Clause Breakdown
                    </span>
                    <span className="text-xs glass-subtle text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-semibold border border-slate-200/60 dark:border-slate-700/60">
                      {activeClause.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mt-1">
                    {activeClause.clauseTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      getRiskColor(activeClause.riskLevel).badge
                    }`}
                  >
                    {getRiskColor(activeClause.riskLevel).icon}
                    {activeClause.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Plain English Translation (Highlighted block) */}
              <div className="p-4 rounded-2xl glass-emerald space-y-1.5 border border-emerald-200 dark:border-emerald-900/60">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Plain-English Translation
                </div>
                <p className="text-sm text-emerald-950 dark:text-emerald-100 leading-relaxed font-semibold">
                  {activeClause.plainEnglish}
                </p>
              </div>

              {/* Why this matters / Practical Impact */}
              <div className="p-4 rounded-2xl glass-amber space-y-1.5 border border-amber-200 dark:border-amber-900/60">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Why This Matters to You
                </div>
                <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
                  {activeClause.whyItMatters}
                </p>
              </div>

              {/* Original Convoluted Snippet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Original Contract Snippet
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(activeClause.originalSnippet, selectedClauseIndex)
                    }
                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedIndex === selectedClauseIndex ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy text
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl glass-subtle text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed max-h-48 overflow-y-auto border border-slate-200/60 dark:border-slate-800">
                  {activeClause.originalSnippet || "Full clause referenced in document text."}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() =>
                    onAskAboutClause(
                      activeClause.originalSnippet || activeClause.clauseTitle,
                      activeClause.clauseTitle
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask AI Grounded Question on this Clause
                </button>

                <button
                  onClick={onOpenGlossary}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Look up legal terms in Glossary
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center glass-panel rounded-3xl text-slate-500 text-sm">
              Select a clause from the left pane to view its plain-English explanation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
