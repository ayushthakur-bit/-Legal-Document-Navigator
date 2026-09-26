/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useReducedMotion } from "motion/react";
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
import { PeekingCatCorner } from "./components/PeekingCatCorner";
import { AntigravityParticleField } from "./components/AntigravityParticleField";

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
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

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
              AI DOCUMENT ANALYSIS
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

      {/* Thin Scroll-Progress Indicator */}
      <motion.div
        style={{ scaleX: shouldReduceMotion ? 0 : scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 z-50 origin-left pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.6)]"
      />

      {/* Screen Reader Live Region for Asynchronous Status Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </div>

      {/* LAYER 1 (BACKGROUND): Slow gradient movement */}
      <div className="ambient-bg pointer-events-none" aria-hidden="true">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
        <div className="ambient-orb-4" />
      </div>

      {/* LAYER 2 (MIDDLE): Subtle Antigravity Particle Field & Floating Geometric Nodes */}
      <AntigravityParticleField />

      {!shouldReduceMotion && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-5" aria-hidden="true">
          {/* Subtle floating decorative nodes with distinct float durations */}
          <motion.div
            animate={{
              y: [0, -14, 0],
              x: [0, 8, 0],
              rotate: [0, 20, 0],
            }}
            transition={{
              duration: 9.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-8 w-2 h-2 rounded-full bg-indigo-500/20 blur-[0.5px]"
          />
          <motion.div
            animate={{
              y: [0, 16, 0],
              x: [0, -10, 0],
              rotate: [0, -25, 0],
            }}
            transition={{
              duration: 11.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-2/3 right-12 w-2.5 h-2.5 rounded-full bg-cyan-400/20 blur-[0.5px]"
          />
          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 12, 0],
            }}
            transition={{
              duration: 8.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-purple-400/25 blur-[0.5px]"
          />
        </div>
      )}

      {/* LAYER 3 (FOREGROUND): Floating Navigation, Cards, Buttons, and Document Elements */}

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
      <motion.main
        id="main-content"
        tabIndex={-1}
        role="main"
        aria-label="AI DOCUMENT ANALYSIS Workspace"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.40, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 pb-24 sm:pb-8 relative z-10 focus:outline-none transition-all duration-300"
      >
        {/* Animated ambient workspace aura & dynamic scanner beam */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden rounded-3xl select-none" aria-hidden="true">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.35, 0.55, 0.35],
              x: [0, 16, 0],
              y: [0, -12, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-20 left-1/4 w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl dark:from-indigo-500/25 dark:via-purple-500/15"
          />
          <motion.div
            animate={{
              scale: [1, 1.14, 1],
              opacity: [0.25, 0.45, 0.25],
              x: [0, -22, 0],
              y: [0, 18, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-bl from-amber-500/10 via-rose-500/10 to-transparent blur-3xl dark:from-amber-500/20 dark:via-rose-500/15"
          />
          {/* Active analysis or tab scanning laser line */}
          {isAnalyzing && (
            <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-workspace-scan shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* VIEW: LOGIN PAGE */}
          {currentAuthView === "login" && (
            <motion.div
              key="view-login"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <LoginPage
                onNavigate={navigateAuth}
                onLoginSuccess={() => navigateAuth("dashboard")}
              />
            </motion.div>
          )}

          {/* VIEW: SIGN UP PAGE */}
          {currentAuthView === "signup" && (
            <motion.div
              key="view-signup"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <SignUpPage
                onNavigate={navigateAuth}
                onSignUpSuccess={() => navigateAuth("dashboard")}
              />
            </motion.div>
          )}

          {/* VIEW: FORGOT PASSWORD PAGE */}
          {currentAuthView === "forgot-password" && (
            <motion.div
              key="view-forgot-password"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <ForgotPasswordPage onNavigate={navigateAuth} />
            </motion.div>
          )}

          {/* VIEW: AUTHENTICATED DASHBOARD */}
          {currentAuthView === "dashboard" && (
            <motion.div
              key="view-dashboard"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <AuthenticatedDashboard
                onNavigate={navigateAuth}
                onOpenDocumentInNavigator={handleOpenUserDocumentInNavigator}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onSwitchToAskAI={() => {
                  navigateAuth("app");
                  setActiveTab("chat");
                }}
              />
            </motion.div>
          )}

          {/* VIEW: MY DOCUMENTS */}
          {currentAuthView === "documents" && (
            <motion.div
              key="view-documents"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <MyDocumentsSection
                onNavigate={navigateAuth}
                onOpenDocumentInNavigator={handleOpenUserDocumentInNavigator}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            </motion.div>
          )}

          {/* VIEW: USER PROFILE */}
          {currentAuthView === "profile" && (
            <motion.div
              key="view-profile"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <UserProfilePage
                onNavigate={navigateAuth}
                onLogout={async () => {
                  await logout();
                  navigateAuth("app");
                  setActiveTab("overview");
                }}
              />
            </motion.div>
          )}

          {/* VIEW: SETTINGS */}
          {currentAuthView === "settings" && (
            <motion.div
              key="view-settings"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <SettingsView
                onNavigate={navigateAuth}
                onLogout={async () => {
                  await logout();
                  navigateAuth("app");
                  setActiveTab("overview");
                }}
              />
            </motion.div>
          )}

          {/* VIEW: LEGAL DOCUMENT NAVIGATOR CORE APP */}
          {currentAuthView === "app" && (
            <motion.div
              key={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
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
      </motion.main>

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

      {/* Subtle playful peeking animated SVG cat in corner while document is being processed */}
      <PeekingCatCorner isAnalyzing={isAnalyzing} />

      {/* Footer */}
      <footer className="glass-panel border-x-0 border-b-0 py-6 mb-16 sm:mb-0 mt-12 no-print relative z-10 border-t border-slate-200/80 dark:border-slate-800">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">AI DOCUMENT ANALYSIS</span>
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
