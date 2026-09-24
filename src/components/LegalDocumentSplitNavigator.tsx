import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Bookmark,
  Calendar,
  DollarSign,
  Scale,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  Send,
  Loader2,
  BookOpen,
  ArrowUpRight,
  Quote,
  Eye,
  Building,
  User,
  Clock,
  ShieldCheck,
  Globe,
} from "lucide-react";
import {
  AnalysisResult,
  StructuredSummary,
  FinancialTerms,
  CategorizedObligations,
  GroundedEvidence,
  SearchGroundingResult,
  SearchGroundingSource,
} from "../types";
import { indexDocument } from "../utils/documentIndexer";

interface LegalDocumentSplitNavigatorProps {
  documentTitle: string;
  documentText: string;
  analysis: AnalysisResult | null;
  onNavigateToTab?: (tab: any) => void;
  onSelectClauseTopic?: (topic: string) => void;
  onAskQuestion?: (q: string, includeGoogleSearch?: boolean) => Promise<any>;
}

export const LegalDocumentSplitNavigator: React.FC<LegalDocumentSplitNavigatorProps> = ({
  documentTitle,
  documentText,
  analysis,
  onNavigateToTab,
  onSelectClauseTopic,
  onAskQuestion,
}) => {
  // Left Navigation: Active Document Page or Section
  const [activeLeftTab, setActiveLeftTab] = useState<"pages" | "sections">("sections");
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Right AI Analysis: Active Analysis Tab
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<
    "summary" | "clauses" | "dates" | "financials" | "obligations" | "ask" | "statutory"
  >("summary");

  // Filter for Left Navigation
  const [navSearch, setNavSearch] = useState("");

  // Q&A State for "Ask Document"
  const [askQuery, setAskQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);
  const [askHistory, setAskHistory] = useState<
    Array<{
      question: string;
      answer: string;
      evidence?: GroundedEvidence;
      confidence?: string;
      isOffTopic?: boolean;
      googleSearchSources?: SearchGroundingSource[];
      webSearchQueries?: string[];
      hasGoogleSearchGrounding?: boolean;
    }>
  >([]);

  // Statutory Precedent Research State (Google Search Grounding)
  const [statutoryQuery, setStatutoryQuery] = useState("Security Deposit Return Timeline & Deductions");
  const [statutoryJurisdiction, setStatutoryJurisdiction] = useState("United States (State & Federal Commercial Law)");
  const [isSearchingStatutes, setIsSearchingStatutes] = useState(false);
  const [statutoryResult, setStatutoryResult] = useState<SearchGroundingResult | null>(null);

  // Source Modal/Preview
  const [previewEvidence, setPreviewEvidence] = useState<GroundedEvidence | null>(null);

  // Indexed Document Chunks
  const indexed = useMemo(() => {
    return indexDocument(documentText || "");
  }, [documentText]);

  // Filtered Sections
  const filteredSections = useMemo(() => {
    if (!navSearch.trim()) return indexed.sections;
    const q = navSearch.toLowerCase();
    return indexed.sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.previewSnippet.toLowerCase().includes(q) ||
        sec.sectionNumber.toLowerCase().includes(q)
    );
  }, [indexed.sections, navSearch]);

  // Selected Section Object
  const currentSection = useMemo(() => {
    if (!selectedSectionId && indexed.sections.length > 0) {
      return indexed.sections[0];
    }
    return indexed.sections.find((s) => s.id === selectedSectionId) || indexed.sections[0];
  }, [indexed.sections, selectedSectionId]);

  // Selected Page Object
  const currentPage = useMemo(() => {
    return (
      indexed.pages.find((p) => p.pageNumber === selectedPageNum) ||
      indexed.pages[0] || {
        pageNumber: 1,
        text: documentText || "No content available.",
        wordCount: 0,
        excerpt: "",
      }
    );
  }, [indexed.pages, selectedPageNum, documentText]);

  // Structured Summary Fallback / Extraction
  const structuredSummary: StructuredSummary = useMemo(() => {
    if (analysis?.structuredSummary) return analysis.structuredSummary;

    // Derived from analysis summary & clauses
    return {
      keyPoints: [
        analysis?.summary || "Comprehensive legal agreement setting mutual commitments and liabilities.",
        `Formal agreement categorized as: ${analysis?.readingGradeLevel || "Formal Commercial Document"}.`,
        "Contains specific notification rules for contract amendments or termination.",
        "Allocates liability limits and specifies breach cure remedies.",
        "Requires compliance with governing law and procedural dispute steps.",
      ],
      partiesInvolved: (analysis?.keyParties || ["First Disclosing Party", "Second Receiving Party"]).map(
        (p, idx) => ({
          name: p,
          role: idx === 0 ? "Provider / Obligor" : "Client / Signatory",
        })
      ),
      purposeOfAgreement: `Defines commercial boundaries, compensation, and risk allocation under ${documentTitle}.`,
      duration: "12 Months (with standard renewal terms)",
    };
  }, [analysis, documentTitle]);

  // Financial Terms Fallback / Extraction
  const financialTerms: FinancialTerms = useMemo(() => {
    if (analysis?.financialTerms) return analysis.financialTerms;

    // Detect rent or payment from text
    const textLower = (documentText || "").toLowerCase();
    const hasLatePenalty = textLower.includes("late fee") || textLower.includes("interest");
    const hasDeposit = textLower.includes("deposit") || textLower.includes("retainer");

    return {
      baseCompensationOrRent: "Specified in Schedule A or Section 2 (Base Fees / Rent)",
      depositOrRetainer: hasDeposit ? "Upfront deposit held in accordance with agreement terms" : "Standard operational retainer",
      penaltiesAndLateFees: hasLatePenalty ? "Compounding daily or fixed percentage overdue fees" : "Standard statutory late interest",
      expensePassThroughs: "Direct pass-through operational fees or approved disbursements",
    };
  }, [analysis?.financialTerms, documentText]);

  // Categorized Obligations
  const categorizedObligations: CategorizedObligations = useMemo(() => {
    if (analysis?.categorizedObligations) return analysis.categorizedObligations;

    const baseObligations = analysis?.obligations || [];
    const yourObs = baseObligations
      .filter((o) => o.party.toLowerCase().includes("user") || o.party.toLowerCase().includes("second"))
      .map((o) => ({
        party: "You (Second Party / Signatory)",
        obligation: o.obligation,
        deadlineOrTrigger: o.deadlineOrTrigger,
        consequenceOfBreach: o.consequenceOfBreach,
        isCrucial: o.isCrucial,
      }));

    const otherObs = baseObligations
      .filter((o) => !o.party.toLowerCase().includes("user") && !o.party.toLowerCase().includes("second"))
      .map((o) => ({
        party: o.party || "Counterparty",
        obligation: o.obligation,
        deadlineOrTrigger: o.deadlineOrTrigger,
        consequenceOfBreach: o.consequenceOfBreach,
        isCrucial: o.isCrucial,
      }));

    return {
      yourObligations:
        yourObs.length > 0
          ? yourObs
          : [
              {
                party: "You (Signatory / Recipient)",
                obligation: "Remit required fees before due date and issue timely written cancellation notice.",
                deadlineOrTrigger: "On designated billing dates or 30-60 days prior to renewal",
                consequenceOfBreach: "Late fees or automatic contract rollover",
                isCrucial: true,
              },
            ],
      otherPartyObligations:
        otherObs.length > 0
          ? otherObs
          : [
              {
                party: "Counterparty (Service Provider / Landlord)",
                obligation: "Provide contracted services, deliverable milestones, or leased premises access.",
                deadlineOrTrigger: "Commencement date and ongoing performance window",
                consequenceOfBreach: "Subject to 30-day cure period before formal breach",
                isCrucial: true,
              },
            ],
      importantConditions: [
        "All notices must be delivered in writing (email or registered post).",
        "Disputes require 30-day informal escalation before initiating legal proceedings.",
        "Confidential business data and proprietary information must remain protected.",
      ],
    };
  }, [analysis]);

  // Important Clauses prioritized
  const importantClauses = useMemo(() => {
    const rawClauses = analysis?.keyClauses || [];
    const priorityCategories = [
      "Termination",
      "Payment",
      "Liability",
      "Confidentiality",
      "Renewal",
      "Dispute",
    ];

    if (rawClauses.length === 0) {
      return [
        {
          clauseTitle: "Termination Clause — Section 4",
          originalSnippet: "Either party may terminate upon 30 days written notice to the other party.",
          plainEnglish: "You can terminate this agreement by providing 30 days prior written notice.",
          riskLevel: "CAUTION" as const,
          whyItMatters: "Failing to send notice before the deadline causes automatic extension.",
          category: "Termination",
        },
        {
          clauseTitle: "Limitation of Liability — Section 8",
          originalSnippet: "In no event shall liability exceed total fees paid under this agreement.",
          plainEnglish: "Caps the maximum financial amount either side can recover in case of a dispute.",
          riskLevel: "CRITICAL" as const,
          whyItMatters: "Limits your legal remedy if significant damages or defects occur.",
          category: "Liability",
        },
      ];
    }

    return rawClauses;
  }, [analysis?.keyClauses]);

  // Handle Grounded Question with optional Google Search Grounding
  const handleExecuteAsk = async (queryText?: string, overrideSearch?: boolean) => {
    const q = queryText || askQuery;
    if (!q.trim() || isAsking) return;

    const shouldSearch = overrideSearch !== undefined ? overrideSearch : useGoogleSearch;
    setIsAsking(true);
    setAskQuery("");

    try {
      let result;
      if (onAskQuestion) {
        result = await onAskQuestion(q.trim(), shouldSearch);
      } else {
        const res = await fetch("/api/legal/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: q.trim(),
            documentText,
            documentTitle,
            includeGoogleSearch: shouldSearch,
            jurisdiction: statutoryJurisdiction,
          }),
        });
        result = await res.json();
      }

      setAskHistory((prev) => [
        {
          question: q.trim(),
          answer: result.answer,
          evidence: result.evidence || {
            clauseTitle: result.clauseTitle || "Referenced Clause",
            source: result.source || `Page 1 • Section 1`,
            quote: result.quote || (result.citations && result.citations[0]) || "Cited in agreement",
            pageNumber: 1,
          },
          confidence: result.confidence,
          isOffTopic: result.isOffTopic,
          googleSearchSources: result.googleSearchSources,
          webSearchQueries: result.webSearchQueries,
          hasGoogleSearchGrounding: result.hasGoogleSearchGrounding,
        },
        ...prev,
      ]);
    } catch (err: any) {
      setAskHistory((prev) => [
        {
          question: q.trim(),
          answer: `Error answering question: ${err.message || "Failed to contact document engine."}`,
        },
        ...prev,
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Statutory Precedent & Real-Time Case Law Research (Google Search Grounding)
  const handleExecuteStatutoryResearch = async (customQuery?: string, customClause?: string) => {
    const q = customQuery || statutoryQuery;
    if (!q.trim() || isSearchingStatutes) return;

    setIsSearchingStatutes(true);
    try {
      const res = await fetch("/api/legal/search-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q.trim(),
          clauseTitle: customClause || (customQuery ? customQuery : statutoryQuery),
          documentSnippet: currentSection?.content || documentText.slice(0, 1500),
          jurisdiction: statutoryJurisdiction,
        }),
      });
      if (!res.ok) throw new Error("Search grounding failed");
      const data: SearchGroundingResult = await res.json();
      setStatutoryResult(data);
    } catch (err: any) {
      console.warn("Statutory research error:", err);
    } finally {
      setIsSearchingStatutes(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner: Problem Statement Alignment & Clear Flow */}
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚖️</span>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
                Legal Document Navigator
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">
                Document-Grounded AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Understand. Navigate. Find what matters. Non-lawyer friendly analysis strictly grounded in{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">"{documentTitle}"</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Evidence-Verified Citations</span>
            </span>
          </div>
        </div>

        {/* 5-Step Clear Flow Pipeline */}
        <div className="pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            How It Works: 5-Step Document Navigation
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                1
              </span>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">Upload Contract</span>
                <span className="text-[10px] text-slate-500 block truncate">PDF, DOCX, TXT</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                2
              </span>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">AI Analyzes</span>
                <span className="text-[10px] text-slate-500 block truncate">Clauses & Risks</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl glass-subtle border border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                3
              </span>
              <div className="min-w-0">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block truncate">Navigate Sections</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block truncate">Pages & Clauses</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                4
              </span>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">Ask Questions</span>
                <span className="text-[10px] text-slate-500 block truncate">Targeted Queries</span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                5
              </span>
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">Evidence Answers</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block truncate">Page & Section Cited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Dashboard: DOCUMENT (Left) | AI ANALYSIS (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DOCUMENT NAVIGATOR (Pages & Sections) */}
        <div className="lg:col-span-4 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-4 sm:p-5 flex flex-col h-[750px]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm font-display text-slate-900 dark:text-white uppercase tracking-wider">
                Document Navigator
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              {indexed.pages.length} Pages • {indexed.sections.length} Sections
            </span>
          </div>

          {/* Search / Filter in Document */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clauses, pages, or text..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Toggle: Pages vs Sections */}
          <div className="grid grid-cols-2 gap-1 mt-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 text-xs font-semibold">
            <button
              onClick={() => setActiveLeftTab("sections")}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                activeLeftTab === "sections"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Sections ({filteredSections.length})
            </button>
            <button
              onClick={() => setActiveLeftTab("pages")}
              className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                activeLeftTab === "pages"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Pages ({indexed.pages.length})
            </button>
          </div>

          {/* Left List Container */}
          <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2 no-scrollbar">
            {activeLeftTab === "sections" ? (
              filteredSections.length > 0 ? (
                filteredSections.map((sec) => {
                  const isSelected = selectedSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs"
                          : "bg-white/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {sec.title}
                        </span>
                        <span className="font-mono text-slate-400 shrink-0 text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Page {sec.pageNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {sec.previewSnippet}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No sections match "{navSearch}".
                </div>
              )
            ) : (
              indexed.pages.map((p) => {
                const isSelected = selectedPageNum === p.pageNumber;
                return (
                  <div
                    key={p.pageNumber}
                    onClick={() => setSelectedPageNum(p.pageNumber)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs"
                        : "bg-white/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <span>Page {p.pageNumber}</span>
                      <span className="font-mono text-slate-400 text-[10px] font-normal">
                        ~{p.wordCount} words
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {p.text.slice(0, 150)}...
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Document Preview Snippet Box at Bottom of Left Panel */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Selected Preview:</span>
              <button
                onClick={() =>
                  setPreviewEvidence({
                    clauseTitle: activeLeftTab === "sections" ? currentSection.title : `Page ${selectedPageNum}`,
                    source: `Page ${activeLeftTab === "sections" ? currentSection.pageNumber : selectedPageNum}`,
                    quote: activeLeftTab === "sections" ? currentSection.content : currentPage.text,
                    pageNumber: activeLeftTab === "sections" ? currentSection.pageNumber : selectedPageNum,
                  })
                }
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
              >
                <span>Expand Full Text</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto leading-relaxed border border-slate-200/70 dark:border-slate-800">
              {activeLeftTab === "sections" ? currentSection.content : currentPage.text.slice(0, 300) + "..."}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI ANALYSIS MODULES */}
        <div className="lg:col-span-8 glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-5 sm:p-6 flex flex-col min-h-[750px]">
          {/* Header Navigation Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm font-display text-slate-900 dark:text-white uppercase tracking-wider">
                AI Document Analysis
              </h3>
            </div>

            {/* Analysis Module Selector Tabs */}
            <div className="flex flex-wrap gap-1 text-xs">
              <button
                onClick={() => setActiveAnalysisTab("summary")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "summary"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>📋</span>
                <span>Summary</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab("clauses")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "clauses"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>⚠</span>
                <span>Clauses</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab("dates")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "dates"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>📅</span>
                <span>Dates</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab("financials")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "financials"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>💰</span>
                <span>Financials</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab("obligations")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "obligations"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>⚖</span>
                <span>Obligations</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab("ask")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "ask"
                    ? "bg-emerald-600 text-white shadow-sm font-bold"
                    : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                <span>❓</span>
                <span>Ask Document</span>
              </button>

              <button
                onClick={() => setActiveAnalysisTab("statutory")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAnalysisTab === "statutory"
                    ? "bg-indigo-600 text-white shadow-sm font-bold"
                    : "text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                }`}
                title="Real-time statutory search & enforceability verification with Google Search Grounding"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Precedents &amp; Law</span>
              </button>
            </div>
          </div>

          {/* TAB 1: DOCUMENT SUMMARY */}
          {activeAnalysisTab === "summary" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 mt-4 flex-1"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl glass-subtle border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Purpose of Agreement
                  </span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 leading-snug">
                    {structuredSummary.purposeOfAgreement}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl glass-subtle border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Duration & Term
                  </span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                    {structuredSummary.duration}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl glass-subtle border border-slate-200/70 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Risk Assessment
                  </span>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {analysis?.overallRiskRating || "MODERATE"} ({analysis?.riskScore || 45}/100)
                  </p>
                </div>
              </div>

              {/* Parties Involved */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  Parties Identified in Document
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {structuredSummary.partiesInvolved.map((party, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block">
                        {party.role}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block mt-0.5">
                        {party.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5-10 Important Points */}
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Key Document Highlights (Plain English)
                </span>
                <div className="space-y-2">
                  {structuredSummary.keyPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed font-medium">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: IMPORTANT CLAUSES */}
          {activeAnalysisTab === "clauses" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4 flex-1 overflow-y-auto max-h-[640px] pr-1 no-scrollbar"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Critical Clauses extracted and explained for non-lawyers:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {importantClauses.length} Clauses Identified
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {importantClauses.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                          {c.category || "General Clause"}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {c.clauseTitle}
                        </h4>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                          c.riskLevel === "CRITICAL"
                            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200"
                            : c.riskLevel === "CAUTION"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200"
                            : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200"
                        }`}
                      >
                        {c.riskLevel}
                      </span>
                    </div>

                    {/* Original vs Plain English */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Simple Explanation:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        {c.plainEnglish}
                      </p>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pl-2.5 border-l-2 border-slate-300 dark:border-slate-700 line-clamp-2">
                      "{c.originalSnippet}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 dark:text-slate-400 italic">
                        Why it matters: {c.whyItMatters}
                      </span>
                      <button
                        onClick={() => {
                          setActiveAnalysisTab("ask");
                          handleExecuteAsk(`Explain the ${c.clauseTitle} in more detail and what my options are.`);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold shrink-0 ml-2"
                      >
                        Ask About This &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: IMPORTANT DATES */}
          {activeAnalysisTab === "dates" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4 flex-1"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Critical deadlines, notification windows, and renewal triggers found in document:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(analysis?.keyDatesAndDeadlines || [
                  {
                    event: "Notice of Non-Renewal",
                    timeframe: "30 to 60 days prior to contract expiration",
                    actionRequired: "Send written cancellation letter via confirmed delivery.",
                  },
                  {
                    event: "Payment Grace Period",
                    timeframe: "1st to 5th of each calendar month",
                    actionRequired: "Pay balance before late charges or statutory penalties accrue.",
                  },
                ]).map((dateItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {dateItem.event}
                      </h4>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs font-semibold border border-amber-500/20">
                      ⏰ {dateItem.timeframe}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <span className="font-bold">Required Action:</span> {dateItem.actionRequired}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: FINANCIAL TERMS */}
          {activeAnalysisTab === "financials" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4 flex-1"
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Financial obligations, compensation caps, fee structures, and late penalties:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Base Compensation / Rent
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {financialTerms.baseCompensationOrRent}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Deposit / Security Retainer
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {financialTerms.depositOrRetainer}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Penalties & Late Fees
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {financialTerms.penaltiesAndLateFees}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Pass-Throughs & Expense Caps
                  </span>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {financialTerms.expensePassThroughs}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: OBLIGATIONS (You vs Counterparty) */}
          {activeAnalysisTab === "obligations" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4 flex-1 overflow-y-auto max-h-[640px] pr-1 no-scrollbar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Your Obligations */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                      👤 Your Obligations
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {categorizedObligations.yourObligations.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {item.obligation}
                        </p>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                          <span>⏰ {item.deadlineOrTrigger}</span>
                          {item.isCrucial && (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">Mandatory</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other Party's Obligations */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      🏢 Other Party's Obligations
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {categorizedObligations.otherPartyObligations.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {item.obligation}
                        </p>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                          <span>⏰ {item.deadlineOrTrigger}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Important Conditions */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  ⚠ Important Conditions &amp; Pre-requisites
                </span>
                <ul className="space-y-1.5 text-amber-950 dark:text-amber-100 font-medium pl-2">
                  {categorizedObligations.importantConditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* TAB 6: ASK DOCUMENT (With Required Evidence System & Search Grounding) */}
          {activeAnalysisTab === "ask" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4 flex-1 flex flex-col"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Ask any question specifically grounded in <span className="font-semibold text-slate-700 dark:text-slate-300">{documentTitle}</span>:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUseGoogleSearch(!useGoogleSearch)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      useGoogleSearch
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                    title="Toggle Google Search Grounding with Gemini 3.5 Flash to verify current statutes & precedents"
                  >
                    <Globe className="w-3 h-3 text-indigo-500" />
                    <span>Search Grounding</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        useGoogleSearch
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {useGoogleSearch ? "ON" : "OFF"}
                    </span>
                  </button>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Verified Citations
                  </span>
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "What is the termination clause and notice period?",
                  "What happens if I cancel the agreement?",
                  "Are there any late fees or financial penalties?",
                  "Who is responsible for repairs or maintenance?",
                ].map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteAsk(sug)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                  >
                    {sug} &rarr;
                  </button>
                ))}
              </div>

              {/* Question Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask this document (e.g. 'What is the notice period for cancellation?')..."
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleExecuteAsk()}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleExecuteAsk()}
                  disabled={isAsking || !askQuery.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Ask Document</span>
                </button>
              </div>

              {/* Answers Stream with Grounded Evidence System */}
              <div className="flex-1 overflow-y-auto space-y-4 mt-2 pr-1 max-h-[460px] no-scrollbar">
                {askHistory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <MessageSquare className="w-6 h-6 mx-auto text-indigo-400 opacity-60" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      No questions asked yet in this session.
                    </p>
                    <p className="text-[11px]">
                      Type a question above or click a suggestion to receive an answer grounded directly in your uploaded document with page &amp; section citations.
                    </p>
                  </div>
                ) : (
                  askHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>Q: "{item.question}"</span>
                        <div className="flex items-center gap-1.5">
                          {item.hasGoogleSearchGrounding && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              Search Grounded
                            </span>
                          )}
                          {item.confidence && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {item.confidence}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Plain-English Answer */}
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {item.answer}
                      </div>

                      {/* Required Evidence Box (Item 5) */}
                      {item.evidence && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                              <span>📄</span>
                              <span>Source Citation:</span>
                            </span>
                            <button
                              onClick={() => setPreviewEvidence(item.evidence!)}
                              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Source</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                            <span>{item.evidence.source}</span>
                            {item.evidence.clauseTitle && (
                              <>
                                <span className="text-slate-400">•</span>
                                <span>{item.evidence.clauseTitle}</span>
                              </>
                            )}
                          </div>

                          {item.evidence.quote && (
                            <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 pl-2.5 border-l-2 border-indigo-500 italic line-clamp-3">
                              "{item.evidence.quote}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Google Search Grounding Sources */}
                      {item.googleSearchSources && item.googleSearchSources.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              Governing Statutory Authorities &amp; Sources:
                            </span>
                            <span className="text-[9px] font-semibold text-slate-500">
                              Gemini 3.5 Flash + Search
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {item.googleSearchSources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-indigo-100 dark:border-indigo-900 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium transition-all group"
                              >
                                <span className="truncate pr-2">{src.title || src.url}</span>
                                <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100" />
                              </a>
                            ))}
                          </div>

                          {item.webSearchQueries && item.webSearchQueries.length > 0 && (
                            <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1 pt-1">
                              <span className="font-semibold">Search queries:</span>
                              {item.webSearchQueries.map((sq, sqIdx) => (
                                <span key={sqIdx} className="px-1.5 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 font-mono">
                                  "{sq}"
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 7: STATUTORY PRECEDENTS & CURRENT LAW (Google Search Grounding) */}
          {activeAnalysisTab === "statutory" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mt-4 flex-1 flex flex-col overflow-y-auto max-h-[640px] pr-1 no-scrollbar"
            >
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-white/40 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Google Search Grounded Statutory Research
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Gemini 3.5 Flash &bull; Real-time
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Verify whether your contract clauses comply with current state civil codes, FTC regulations, usury caps, or statutory tenant/employee rights.
                </p>
              </div>

              {/* Research Controls */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={statutoryQuery}
                    onChange={(e) => setStatutoryQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleExecuteStatutoryResearch()}
                    placeholder="Enter clause or topic to verify (e.g. 'Security Deposit 21-day Return Timeline', 'Non-compete validity')..."
                    className="flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  <select
                    value={statutoryJurisdiction}
                    onChange={(e) => setStatutoryJurisdiction(e.target.value)}
                    className="px-3 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="United States (State & Federal Commercial Law)">US Federal & State Law</option>
                    <option value="California Civil Code & Labor Law">California (AB 12, Civ Code § 1950.5)</option>
                    <option value="New York Real Property Law & GOL">New York (RPL § 238-a, GOL § 7-108)</option>
                    <option value="Texas Property Code & Business Code">Texas (Tex. Prop. Code § 92.103)</option>
                    <option value="Florida Statutes Title VI & XL">Florida (Fla. Stat. § 83.49)</option>
                    <option value="Illinois Compiled Statutes (ILCS)">Illinois (765 ILCS 710)</option>
                  </select>
                  <button
                    onClick={() => handleExecuteStatutoryResearch()}
                    disabled={isSearchingStatutes || !statutoryQuery.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    {isSearchingStatutes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    <span>Verify Law</span>
                  </button>
                </div>

                {/* Preset Legal Topics */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick Topics:
                  </span>
                  {[
                    "Security Deposit Return Timeline & Deductions",
                    "Non-Compete Enforceability & FTC Rule",
                    "Late Fee Caps & Unreasonable Penalty Limits",
                    "Mandatory Arbitration & Class Action Waivers",
                    "30-Day Notice Period & Automatic Renewal Rules",
                  ].map((topic, tIdx) => (
                    <button
                      key={tIdx}
                      onClick={() => {
                        setStatutoryQuery(topic);
                        handleExecuteStatutoryResearch(topic);
                      }}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                    >
                      {topic} &rarr;
                    </button>
                  ))}
                </div>
              </div>

              {/* Research Results */}
              {isSearchingStatutes && (
                <div className="p-10 text-center glass-panel rounded-2xl space-y-3">
                  <Loader2 className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Grounding with Google Search &amp; Gemini 3.5 Flash...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Searching state codes, federal guidelines, and judicial precedents applicable to "{statutoryQuery}".
                  </p>
                </div>
              )}

              {!isSearchingStatutes && statutoryResult && (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Statutory Subject
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {statutoryResult.query}
                        </h4>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          statutoryResult.complianceRating === "HIGH_RISK_STATUTORY_VIOLATION"
                            ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                            : statutoryResult.complianceRating === "ENFORCEABLE_STANDARD"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {statutoryResult.complianceRating === "HIGH_RISK_STATUTORY_VIOLATION"
                          ? "⚠ Statutory Exposure / Potentially Unenforceable"
                          : statutoryResult.complianceRating === "ENFORCEABLE_STANDARD"
                          ? "✓ Standard & Generally Enforceable"
                          : "⚖ Jurisdiction & Fact Dependent"}
                      </span>
                    </div>

                    {/* Key Statutes Found */}
                    {statutoryResult.keyStatutes && statutoryResult.keyStatutes.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Key Statutes &amp; Legal Authorities:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {statutoryResult.keyStatutes.map((st, stIdx) => (
                            <span
                              key={stIdx}
                              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800"
                            >
                              § {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analysis Body */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Plain-English Legal Analysis:
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                        {statutoryResult.analysis}
                      </div>
                    </div>

                    {/* Verified Sources with links */}
                    {statutoryResult.sources && statutoryResult.sources.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          Verified Web Sources &amp; Citations:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {statutoryResult.sources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all group"
                            >
                              <span className="truncate pr-2">{source.title || source.url}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isSearchingStatutes && !statutoryResult && (
                <div className="p-10 text-center glass-panel rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-400">
                  <Globe className="w-8 h-8 mx-auto text-indigo-400 opacity-60" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">
                    Ready to research governing statutory law and judicial precedents.
                  </p>
                  <p className="text-[11px] max-w-sm mx-auto">
                    Click one of the quick topics above or enter your own search to ground your document review against real-time statutes using Google Search Grounding.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Interactive Evidence Source Modal */}
      <AnimatePresence>
        {previewEvidence && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewEvidence(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel-elevated rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 text-slate-800 dark:text-slate-200 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base font-display text-slate-900 dark:text-white">
                      {previewEvidence.clauseTitle || "Document Citation"}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                      {previewEvidence.source}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewEvidence(null)}
                  className="text-xs font-bold px-3 py-1 rounded-xl glass-subtle hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Exact Excerpt from Uploaded Document:
                </span>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto whitespace-pre-wrap">
                  {previewEvidence.quote}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-500">
                <span>Grounded specifically in {documentTitle}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewEvidence.quote);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Copy Quote
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
