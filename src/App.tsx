/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SAMPLE_DOCUMENTS } from "./data/sampleDocuments";
import {
  AnalysisResult,
  ComparisonResult,
  AttorneyBriefResult,
  SampleDocument,
} from "./types";
import { ThemeProvider } from "./context/ThemeContext";
import { RecentDocumentsProvider, useRecentDocuments } from "./context/RecentDocumentsContext";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { ClauseNavigatorView } from "./components/ClauseNavigatorView";
import { ObligationsMatrixView } from "./components/ObligationsMatrixView";
import { ContractComparisonView } from "./components/ContractComparisonView";
import { GroundedLegalChatView } from "./components/GroundedLegalChatView";
import { VoiceConversationView } from "./components/VoiceConversationView";
import { AttorneyPrepView } from "./components/AttorneyPrepView";
import { DocumentDetectionView } from "./components/DocumentDetectionView";
import { DocumentIntakeModal } from "./components/DocumentIntakeModal";
import { LegalGlossaryModal } from "./components/LegalGlossaryModal";
import { ExportPdfModal } from "./components/ExportPdfModal";
import { FloatingAIAssistant } from "./components/FloatingAIAssistant";
import { DocumentAnalyzingOverlay } from "./components/DocumentAnalyzingOverlay";

function AppContent() {
  const [currentDoc, setCurrentDoc] = useState<SampleDocument>(SAMPLE_DOCUMENTS[0]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "upload" | "clauses" | "obligations" | "compare" | "chat" | "voice" | "attorney-prep"
  >("overview");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [attorneyBrief, setAttorneyBrief] = useState<AttorneyBriefResult | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Local state management for recently analyzed documents
  const {
    saveRecentAnalysis,
    updateRecentAuxiliary,
    getCachedRecord,
    setActiveRecentId,
  } = useRecentDocuments();

  // Analyze document via backend API
  const analyzeDocument = useCallback(
    async (text: string, title: string, docType: string, docObject?: SampleDocument) => {
      setIsAnalyzing(true);
      try {
        const res = await fetch("/api/legal/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentText: text,
            documentTitle: title,
            documentType: docType,
          }),
        });
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data: AnalysisResult = await res.json();
        setAnalysis(data);

        // Store analysis in local state cache for instant subsequent switches
        const target = docObject || currentDoc;
        saveRecentAnalysis(target, data);
      } catch (err) {
        console.error("Analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [currentDoc, saveRecentAnalysis]
  );

  // Handle document selection with instant local cache retrieval
  const handleSelectDocument = useCallback(
    (doc: SampleDocument) => {
      // 1. Check local state / localStorage cache first
      const cached = getCachedRecord(doc.id, doc.fullText);
      if (cached && cached.analysis) {
        // INSTANT SWITCH without re-processing!
        setCurrentDoc(doc);
        setAnalysis(cached.analysis);
        setComparisonResult(cached.comparisonResult || null);
        setAttorneyBrief(cached.attorneyBrief || null);
        setIsAnalyzing(false);
        setActiveRecentId(cached.id);
        return;
      }

      // 2. If not cached, switch document and initiate analysis
      setCurrentDoc(doc);
      setComparisonResult(null);
      setAttorneyBrief(null);
      analyzeDocument(doc.fullText, doc.title, doc.category, doc);
    },
    [getCachedRecord, analyzeDocument, setActiveRecentId]
  );

  // Initial load check
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      const cached = getCachedRecord(currentDoc.id, currentDoc.fullText);
      if (cached && cached.analysis) {
        setAnalysis(cached.analysis);
        setComparisonResult(cached.comparisonResult || null);
        setAttorneyBrief(cached.attorneyBrief || null);
        setActiveRecentId(cached.id);
      } else {
        analyzeDocument(currentDoc.fullText, currentDoc.title, currentDoc.category, currentDoc);
      }
    }
  }, [hasInitialized, currentDoc, getCachedRecord, analyzeDocument, setActiveRecentId]);

  // Handle custom document upload
  const handleCustomDocument = (title: string, text: string, type: string) => {
    const newDoc: SampleDocument = {
      id: `custom-${Date.now()}`,
      title,
      category: (type as any) || "Commercial Contract",
      tag: type,
      description: "Custom user-provided legal document",
      fullText: text,
      suggestedQuestions: [
        "What are the major liabilities or penalties under this agreement?",
        "Can either party terminate without cause, and what notice is required?",
        "Are there any one-sided indemnification or fee-shifting clauses?",
        "What are the critical performance obligations and deadlines?",
      ],
    };
    handleSelectDocument(newDoc);
  };

  const handleAnalyzeAndLoadFromDetection = (title: string, text: string, type: string) => {
    handleCustomDocument(title, text, type);
    setActiveTab("overview");
  };

  // Reset/clear current document risk analysis to empty state
  const handleResetAnalysis = useCallback(() => {
    setAnalysis(null);
    setComparisonResult(null);
    setAttorneyBrief(null);
  }, []);

  // Handle Grounded Q&A
  const handleAskQuestion = async (question: string) => {
    const res = await fetch("/api/legal/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        documentText: currentDoc.fullText,
        documentTitle: currentDoc.title,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to answer: ${res.statusText}`);
    }
    return res.json();
  };

  // Handle Contract Comparison
  const handleRunComparison = async (
    docATitle: string,
    docA: string,
    docBTitle: string,
    docB: string
  ) => {
    setIsComparing(true);
    try {
      const res = await fetch("/api/legal/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docA,
          docB,
          docATitle,
          docBTitle,
        }),
      });
      if (!res.ok) throw new Error("Comparison request failed");
      const data: ComparisonResult = await res.json();
      setComparisonResult(data);
      updateRecentAuxiliary(currentDoc.id, { comparisonResult: data });
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setIsComparing(false);
    }
  };

  // Handle Attorney Brief Generation
  const handleGenerateAttorneyBrief = async (userConcerns: string) => {
    setIsGeneratingBrief(true);
    try {
      const res = await fetch("/api/legal/attorney-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: currentDoc.fullText,
          documentTitle: currentDoc.title,
          documentType: currentDoc.category,
          userConcerns,
        }),
      });
      if (!res.ok) throw new Error("Brief generation failed");
      const data: AttorneyBriefResult = await res.json();
      setAttorneyBrief(data);
      updateRecentAuxiliary(currentDoc.id, { attorneyBrief: data });
    } catch (err) {
      console.error("Attorney brief error:", err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  // Shortcut from Clause Navigator directly to Q&A
  const handleAskAboutClause = (clauseSnippet: string, clauseTitle: string) => {
    setActiveTab("chat");
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col antialiased relative selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="ambient-bg pointer-events-none">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Educational Notice Banner */}
      <DisclaimerBanner />

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sampleDocuments={SAMPLE_DOCUMENTS}
        currentDocumentId={currentDoc.id}
        onSelectSampleDocument={handleSelectDocument}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenGlossaryModal={() => setIsGlossaryModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isAnalyzing={isAnalyzing}
        documentTitle={currentDoc.title}
      />

      {/* Main Content Area with Animated Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "overview" && (
              <DashboardView
                analysis={analysis}
                documentTitle={currentDoc.title}
                currentDocumentId={currentDoc.id}
                onSelectDocument={handleSelectDocument}
                onNavigateToTab={setActiveTab}
                onOpenGlossary={() => setIsGlossaryModalOpen(true)}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onResetAnalysis={handleResetAnalysis}
              />
            )}

            {activeTab === "upload" && (
              <DocumentDetectionView
                onAnalyzeAndLoad={handleAnalyzeAndLoadFromDetection}
                sampleDocuments={SAMPLE_DOCUMENTS}
                currentDocumentTitle={currentDoc.title}
              />
            )}

            {activeTab === "clauses" && (
              <ClauseNavigatorView
                clauses={analysis?.keyClauses || []}
                fullDocumentText={currentDoc.fullText}
                onAskAboutClause={handleAskAboutClause}
                onOpenGlossary={() => setIsGlossaryModalOpen(true)}
              />
            )}

            {activeTab === "obligations" && (
              <ObligationsMatrixView
                obligations={analysis?.obligations || []}
                keyDates={analysis?.keyDatesAndDeadlines || []}
                parties={analysis?.keyParties || []}
              />
            )}

            {activeTab === "compare" && (
              <ContractComparisonView
                currentDocumentTitle={currentDoc.title}
                currentDocumentText={currentDoc.fullText}
                comparisonPair={currentDoc.comparisonPair}
                comparisonResult={comparisonResult}
                onRunComparison={handleRunComparison}
                isComparing={isComparing}
              />
            )}

            {activeTab === "chat" && (
              <GroundedLegalChatView
                documentTitle={currentDoc.title}
                documentText={currentDoc.fullText}
                suggestedQuestions={currentDoc.suggestedQuestions}
                onAskQuestion={handleAskQuestion}
                onSwitchToVoice={() => setActiveTab("voice")}
              />
            )}

            {activeTab === "voice" && (
              <VoiceConversationView
                documentTitle={currentDoc.title}
                documentText={currentDoc.fullText}
                suggestedQuestions={currentDoc.suggestedQuestions}
              />
            )}

            {activeTab === "attorney-prep" && (
              <AttorneyPrepView
                documentTitle={currentDoc.title}
                documentText={currentDoc.fullText}
                documentType={currentDoc.category}
                brief={attorneyBrief}
                onGenerateBrief={handleGenerateAttorneyBrief}
                isGenerating={isGeneratingBrief}
                onOpenExportModal={() => setIsExportModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI Assistant for quick inquiries */}
      <FloatingAIAssistant
        documentTitle={currentDoc.title}
        documentText={currentDoc.fullText}
        onNavigateToFullChat={() => setActiveTab("chat")}
      />

      {/* Analyzing Overlay when parsing a new document */}
      <DocumentAnalyzingOverlay
        isAnalyzing={isAnalyzing}
        documentTitle={currentDoc.title}
      />

      {/* Footer */}
      <footer className="glass-panel border-x-0 border-b-0 py-6 mt-12 no-print relative z-10 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Legal Document Navigator</span>
            <span>&bull;</span>
            <span>GenAI Document Accessibility &amp; Strategic Review</span>
          </div>
          <div className="text-center sm:text-right">
            Designed for informational navigation and consultation prep. Always consult a licensed attorney for binding legal counsel.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentIntakeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLoadCustomDocument={handleCustomDocument}
        sampleDocuments={SAMPLE_DOCUMENTS}
        onSelectSampleDocument={handleSelectDocument}
      />

      <LegalGlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
        documentTerms={analysis?.legalGlossary || []}
      />

      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        document={currentDoc}
        analysis={analysis}
        attorneyBrief={attorneyBrief}
        onGenerateBrief={handleGenerateAttorneyBrief}
        isGeneratingBrief={isGeneratingBrief}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RecentDocumentsProvider>
        <AppContent />
      </RecentDocumentsProvider>
    </ThemeProvider>
  );
}
