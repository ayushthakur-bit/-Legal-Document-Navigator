/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SAMPLE_DOCUMENTS } from "./data/sampleDocuments";
import { PRECOMPUTED_SAMPLE_ANALYSES } from "./data/sampleAnalyses";
import {
  AnalysisResult,
  ComparisonResult,
  AttorneyBriefResult,
  SampleDocument,
  AuthPageView,
  UserDocumentRecord,
} from "./types";
import { ThemeProvider } from "./context/ThemeContext";
import { RecentDocumentsProvider, useRecentDocuments } from "./context/RecentDocumentsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserDocumentsProvider, useUserDocuments } from "./context/UserDocumentsContext";
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

// Auth & User Account Views
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { AuthenticatedDashboard } from "./components/AuthenticatedDashboard";
import { MyDocumentsSection } from "./components/MyDocumentsSection";
import { UserProfilePage } from "./components/UserProfilePage";
import { SettingsView } from "./components/SettingsView";
import { Loader2, Scale } from "lucide-react";

// Route path resolution helpers for standard URL & SPA hash support
export function getAuthViewFromPath(pathname: string, hash: string): AuthPageView {
  const cleanPath = pathname.toLowerCase().replace(/^\/+|\/+$/g, "");
  const cleanHash = hash.toLowerCase().replace(/^#\/?/, "");
  const target = cleanHash || cleanPath;

  switch (target) {
    case "dashboard":
      return "dashboard";
    case "documents":
    case "my-documents":
      return "documents";
    case "profile":
      return "profile";
    case "login":
    case "signin":
      return "login";
    case "signup":
    case "register":
      return "signup";
    case "forgot-password":
    case "reset-password":
      return "forgot-password";
    case "settings":
      return "settings";
    case "app":
    case "navigator":
      return "app";
    default:
      return "app";
  }
}

export function getPathForAuthView(view: AuthPageView): string {
  switch (view) {
    case "dashboard":
      return "/dashboard";
    case "documents":
      return "/documents";
    case "profile":
      return "/profile";
    case "login":
      return "/login";
    case "signup":
      return "/signup";
    case "forgot-password":
      return "/forgot-password";
    case "settings":
      return "/settings";
    case "app":
    default:
      return "/";
  }
}

function AppContent() {
  const { currentUser, loading: authLoading, logout } = useAuth();
  const { saveUserDocument } = useUserDocuments();

  const [currentDoc, setCurrentDoc] = useState<SampleDocument>(SAMPLE_DOCUMENTS[0]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "upload" | "clauses" | "obligations" | "compare" | "chat" | "voice" | "attorney-prep"
  >("overview");

  // Track page navigation (app, login, signup, forgot-password, dashboard, documents, profile, settings)
  const [currentAuthView, setCurrentAuthView] = useState<AuthPageView>(() => {
    if (typeof window !== "undefined") {
      return getAuthViewFromPath(window.location.pathname, window.location.hash);
    }
    return "app";
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Initialize with precomputed analysis for instant zero-latency rendering
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    () => PRECOMPUTED_SAMPLE_ANALYSES[SAMPLE_DOCUMENTS[0].id] || null
  );
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [attorneyBrief, setAttorneyBrief] = useState<AttorneyBriefResult | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>("");

  // Local state management for recently analyzed documents
  const {
    saveRecentAnalysis,
    updateRecentAuxiliary,
    getCachedRecord,
    setActiveRecentId,
  } = useRecentDocuments();

  // Synchronize browser history and address bar when currentAuthView changes
  const navigateAuth = useCallback((view: AuthPageView) => {
    setCurrentAuthView(view);
    if (typeof window !== "undefined") {
      const newPath = getPathForAuthView(view);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ authView: view }, "", newPath);
      }
    }
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const resolved = getAuthViewFromPath(window.location.pathname, window.location.hash);
      setCurrentAuthView(resolved);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  // Protect private pages: if unauthenticated user tries to access dashboard, documents, or profile -> redirect to login
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        if (
          currentAuthView === "dashboard" ||
          currentAuthView === "documents" ||
          currentAuthView === "profile"
        ) {
          navigateAuth("login");
        }
      }
    }
  }, [authLoading, currentUser, currentAuthView, navigateAuth]);

  // Analyze document via backend API
  const analyzeDocument = useCallback(
    async (text: string, title: string, docType: string, docObject?: SampleDocument) => {
      setIsAnalyzing(true);
      setAriaAnnouncement(`Analyzing legal document: ${title}`);
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
        setAriaAnnouncement(`Analysis completed for ${title}. Risk score: ${data.riskScore} percent.`);

        // Store analysis in local state cache for instant subsequent switches
        const target = docObject || currentDoc;
        saveRecentAnalysis(target, data);

        // If user is authenticated, save/update document analysis directly to their cloud storage
        if (currentUser) {
          try {
            await saveUserDocument(
              target.title,
              target.category,
              target.fullText,
              data,
              comparisonResult,
              attorneyBrief
            );
          } catch (cloudErr) {
            console.warn("Could not auto-sync analysis to Firestore:", cloudErr);
          }
        }
      } catch (err) {
        console.error("Analysis failed:", err);
        setAriaAnnouncement("Document analysis failed. Please retry.");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [currentDoc, saveRecentAnalysis, currentUser, saveUserDocument, comparisonResult, attorneyBrief]
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
        setAriaAnnouncement(`Loaded cached analysis for ${doc.title}`);
        return;
      }

      // 2. Check instant precomputed analysis catalog (0ms latency, 100% efficiency)
      if (PRECOMPUTED_SAMPLE_ANALYSES[doc.id]) {
        const pre = PRECOMPUTED_SAMPLE_ANALYSES[doc.id];
        setCurrentDoc(doc);
        setAnalysis(pre);
        setComparisonResult(null);
        setAttorneyBrief(null);
        setIsAnalyzing(false);
        saveRecentAnalysis(doc, pre);
        setAriaAnnouncement(`Loaded analysis for ${doc.title}`);
        return;
      }

      // 3. Fallback: switch document and initiate live analysis
      setCurrentDoc(doc);
      setComparisonResult(null);
      setAttorneyBrief(null);
      analyzeDocument(doc.fullText, doc.title, doc.category, doc);
    },
    [getCachedRecord, analyzeDocument, setActiveRecentId, saveRecentAnalysis]
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
      } else if (PRECOMPUTED_SAMPLE_ANALYSES[currentDoc.id]) {
        const pre = PRECOMPUTED_SAMPLE_ANALYSES[currentDoc.id];
        setAnalysis(pre);
        saveRecentAnalysis(currentDoc, pre);
      } else {
        analyzeDocument(currentDoc.fullText, currentDoc.title, currentDoc.category, currentDoc);
      }
    }
  }, [hasInitialized, currentDoc, getCachedRecord, analyzeDocument, setActiveRecentId, saveRecentAnalysis]);


  // Handle custom document upload
  const handleCustomDocument = async (title: string, text: string, type: string) => {
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

    // If authenticated, also persist to user documents
    if (currentUser) {
      try {
        await saveUserDocument(title, type, text);
      } catch (err) {
        console.warn("Could not save uploaded document to user storage:", err);
      }
    }
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

  // Handle Grounded Q&A with optional Google Search Grounding
  const handleAskQuestion = async (question: string, includeGoogleSearch = false) => {
    const res = await fetch("/api/legal/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        documentText: currentDoc.fullText,
        documentTitle: currentDoc.title,
        includeGoogleSearch,
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

  // Re-open saved cloud document in Legal Document Navigator
  const handleOpenUserDocumentInNavigator = (userDoc: UserDocumentRecord) => {
    const sampleDoc: SampleDocument = {
      id: userDoc.id,
      title: userDoc.fileName,
      category: (userDoc.fileType as any) || "Commercial Contract",
      tag: userDoc.fileType,
      description: userDoc.summary || "Cloud-stored legal document",
      fullText: userDoc.documentText,
      suggestedQuestions: [
        "What are the major liabilities or penalties under this agreement?",
        "Can either party terminate without cause, and what notice is required?",
        "Are there any one-sided indemnification or fee-shifting clauses?",
        "What are the critical performance obligations and deadlines?",
      ],
    };

    setCurrentDoc(sampleDoc);

    if (userDoc.analysis) {
      setAnalysis(userDoc.analysis);
      setComparisonResult(userDoc.comparisonResult || null);
      setAttorneyBrief(userDoc.attorneyBrief || null);
    } else {
      analyzeDocument(sampleDoc.fullText, sampleDoc.title, sampleDoc.category, sampleDoc);
    }

    navigateAuth("app");
    setActiveTab("overview");
  };

  // Authentication Loading State to eliminate flickering
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-indigo-400 flex items-center justify-center mx-auto shadow-xl border border-white/20">
            <Scale className="w-7 h-7 text-indigo-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Legal Document Navigator
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Verifying secure workspace session...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 flex flex-col antialiased relative selection:bg-indigo-500/20 selection:text-indigo-600 transition-colors duration-300">
      {/* WCAG 2.1 AA Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-xl focus:font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
      >
        Skip to main legal content
      </a>

      {/* Screen Reader Live Region for Asynchronous Status Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </div>

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
        currentAuthView={currentAuthView}
        onNavigateAuth={navigateAuth}
      />

      {/* Main Content Area with Animated Transitions */}
      <main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="Legal Document Navigator Workspace"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {/* VIEW: LOGIN PAGE */}
          {currentAuthView === "login" && (
            <LoginPage
              onNavigate={navigateAuth}
              onLoginSuccess={() => navigateAuth("dashboard")}
            />
          )}

          {/* VIEW: SIGN UP PAGE */}
          {currentAuthView === "signup" && (
            <SignUpPage
              onNavigate={navigateAuth}
              onSignUpSuccess={() => navigateAuth("dashboard")}
            />
          )}

          {/* VIEW: FORGOT PASSWORD PAGE */}
          {currentAuthView === "forgot-password" && (
            <ForgotPasswordPage onNavigate={navigateAuth} />
          )}

          {/* VIEW: AUTHENTICATED DASHBOARD */}
          {currentAuthView === "dashboard" && (
            <AuthenticatedDashboard
              onNavigate={navigateAuth}
              onOpenDocumentInNavigator={handleOpenUserDocumentInNavigator}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onSwitchToAskAI={() => {
                navigateAuth("app");
                setActiveTab("chat");
              }}
            />
          )}

          {/* VIEW: MY DOCUMENTS */}
          {currentAuthView === "documents" && (
            <MyDocumentsSection
              onNavigate={navigateAuth}
              onOpenDocumentInNavigator={handleOpenUserDocumentInNavigator}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
            />
          )}

          {/* VIEW: USER PROFILE */}
          {currentAuthView === "profile" && (
            <UserProfilePage
              onNavigate={navigateAuth}
              onLogout={async () => {
                await logout();
                navigateAuth("app");
                setActiveTab("overview");
              }}
            />
          )}

          {/* VIEW: SETTINGS */}
          {currentAuthView === "settings" && (
            <SettingsView
              onNavigate={navigateAuth}
              onLogout={async () => {
                await logout();
                navigateAuth("app");
                setActiveTab("overview");
              }}
            />
          )}

          {/* VIEW: LEGAL DOCUMENT NAVIGATOR CORE APP */}
          {currentAuthView === "app" && (
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
                  documentText={currentDoc.fullText}
                  currentDocumentId={currentDoc.id}
                  onSelectDocument={handleSelectDocument}
                  onNavigateToTab={setActiveTab}
                  onOpenGlossary={() => setIsGlossaryModalOpen(true)}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                  onResetAnalysis={handleResetAnalysis}
                  onAskQuestion={handleAskQuestion}
                  isAnalyzing={isAnalyzing}
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
          )}
        </AnimatePresence>
      </main>

      {/* Floating AI Assistant for quick inquiries (when in app view) */}
      {currentAuthView === "app" && (
        <FloatingAIAssistant
          documentTitle={currentDoc.title}
          documentText={currentDoc.fullText}
          onNavigateToFullChat={() => setActiveTab("chat")}
        />
      )}

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
      <AuthProvider>
        <UserDocumentsProvider>
          <RecentDocumentsProvider>
            <AppContent />
          </RecentDocumentsProvider>
        </UserDocumentsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
