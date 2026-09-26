import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Scale,
  FileText,
  GitCompare,
  MessageSquare,
  FileCheck2,
  ListOrdered,
  BookOpen,
  UploadCloud,
  ChevronDown,
  Sparkles,
  Mic,
  Sun,
  Moon,
  Search,
  Bell,
  CheckCircle2,
  History,
  X,
  Zap,
  Receipt,
  FileDown,
  User,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogIn,
  UserPlus,
  Menu,
  ArrowLeft,
  Download,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { SampleDocument, AuthPageView } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useRecentDocuments } from "../context/RecentDocumentsContext";
import { useAuth } from "../context/AuthContext";
import {
  downloadLegalFormatPdf,
  downloadLegalFormatDoc,
  downloadLegalFormatTxt,
} from "../utils/exportPdf";
import { MagneticButton } from "./MagneticButton";

interface NavbarProps {
  activeTab: "overview" | "upload" | "clauses" | "obligations" | "compare" | "chat" | "voice" | "attorney-prep";
  onTabChange: (tab: "overview" | "upload" | "clauses" | "obligations" | "compare" | "chat" | "voice" | "attorney-prep") => void;
  sampleDocuments: SampleDocument[];
  currentDocumentId: string;
  onSelectSampleDocument: (doc: SampleDocument) => void;
  onOpenUploadModal: () => void;
  onOpenGlossaryModal: () => void;
  onOpenExportModal?: () => void;
  isAnalyzing: boolean;
  documentTitle: string;
  currentAuthView: AuthPageView;
  onNavigateAuth: (view: AuthPageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  sampleDocuments,
  currentDocumentId,
  onSelectSampleDocument,
  onOpenUploadModal,
  onOpenGlossaryModal,
  onOpenExportModal,
  isAnalyzing,
  documentTitle,
  currentAuthView,
  onNavigateAuth,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [formatCategoryFilter, setFormatCategoryFilter] = useState<string>("all");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Fallback if blocked in strict sandbox
    }
  };

  const { isDark, toggleTheme } = useTheme();
  const { recentDocuments, removeRecentDocument, formatTimeAgo } = useRecentDocuments();
  const { currentUser, userProfile, logout, formatInitials } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const handleDownloadFormat = (
    doc: SampleDocument,
    format: "pdf" | "doc" | "txt"
  ) => {
    let success = false;
    if (format === "pdf") {
      success = downloadLegalFormatPdf(doc.title, doc.category, doc.fullText);
    } else if (format === "doc") {
      success = downloadLegalFormatDoc(doc.title, doc.category, doc.fullText);
    } else {
      success = downloadLegalFormatTxt(doc.title, doc.category, doc.fullText);
    }

    if (success) {
      setDownloadFeedback(`Downloaded ${doc.title.slice(0, 30)}... (${format.toUpperCase()})`);
      setTimeout(() => setDownloadFeedback(null), 3500);
    }
  };

  interface NavItem {
    id: "overview" | "upload" | "clauses" | "obligations" | "compare" | "chat" | "voice" | "attorney-prep";
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: FileCheck2 },
    { id: "upload", label: "Upload & Detect", icon: UploadCloud, badge: "AUTO" },
    { id: "clauses", label: "Clauses", icon: FileText },
    { id: "obligations", label: "Obligations", icon: ListOrdered },
    { id: "compare", label: "Compare", icon: GitCompare },
    { id: "chat", label: "Q&A", icon: MessageSquare },
    { id: "voice", label: "Voice", icon: Mic, badge: "LIVE" },
    { id: "attorney-prep", label: "Attorney Prep", icon: Scale },
  ];

  const handleLogoutClick = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    onNavigateAuth("app");
    onTabChange("overview");
  };

  const displayName = userProfile?.fullName || currentUser?.displayName || currentUser?.email?.split("@")[0] || "User";
  const initials = formatInitials(displayName);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Header Navigation Bar with backdrop blur */}
      <div
        className={`w-full pt-safe backdrop-blur-xl transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.28)] border-b ${
          isDark
            ? "border-indigo-500/20 bg-slate-950/85"
            : "border-blue-600/30 bg-blue-700/90 shadow-blue-950/15"
        }`}
      >
        {/* Tier 1: Brand, Document Selector, Actions & Theme Toggle */}
        <div
          className={`w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 text-white transition-colors duration-300 ${
            isDark ? "bg-transparent" : "bg-transparent"
          }`}
        >
        <div
          className={`flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 transition-colors ${
            isDark ? "border-b border-indigo-500/15" : "border-b border-blue-500/40"
          }`}
        >
          {/* Brand & Identity + Active Document Context */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0"
          >
            <button
              onClick={() => {
                onNavigateAuth("app");
                onTabChange("overview");
              }}
              className="flex items-center gap-1.5 sm:gap-2.5 text-left cursor-pointer group min-w-0"
              title="Return to Home Overview"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-all ${
                  isDark
                    ? "bg-gradient-to-tr from-amber-500/20 via-indigo-600/30 to-indigo-950 text-indigo-400 border border-indigo-500/40 group-hover:border-indigo-400/80"
                    : "bg-white/20 text-white border border-white/40 group-hover:border-white/80"
                }`}
              >
                <Scale className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-indigo-300" : "text-white"}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h1 className="font-display font-bold text-xs sm:text-base text-white tracking-tight leading-tight truncate">
                    <span className="sm:hidden">AI DOC ANALYSIS</span>
                    <span className="hidden sm:inline">AI DOCUMENT ANALYSIS</span>
                  </h1>
                  <span
                    className={`hidden xl:inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      isDark
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-white/20 text-white border border-white/30"
                    }`}
                  >
                    Enterprise
                  </span>
                </div>
                <p
                  className={`text-[9px] sm:text-[11px] font-semibold tracking-wider uppercase mt-0.5 truncate flex items-center gap-1 ${
                    isDark ? "text-indigo-400" : "text-blue-100"
                  }`}
                >
                  <span>AI Legal</span>
                  <span className={`${isDark ? "text-neutral-600" : "text-blue-300"} hidden sm:inline`}>&bull;</span>
                  <span className={`${isDark ? "text-emerald-400" : "text-emerald-300"} hidden sm:inline font-mono text-[9px]`}>Grounded</span>
                </p>
              </div>
            </button>

            {/* Back Button when Auth page (login / signup / forgot-password) is open */}
            {(currentAuthView === "login" || currentAuthView === "signup" || currentAuthView === "forgot-password") && (
              <div className="relative ml-1 sm:ml-2 shrink-0">
                <button
                  id="btn-nav-auth-back"
                  type="button"
                  onClick={() => {
                    onNavigateAuth("app");
                    onTabChange("overview");
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer border shadow-2xs group ${
                    isDark
                      ? "text-neutral-200 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700"
                      : "text-white bg-blue-700/80 hover:bg-blue-800 border-blue-500/60 hover:border-blue-400"
                  }`}
                  title="Return to Legal Document Navigator"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                  <span className="hidden sm:inline">Back to Document</span>
                  <span className="sm:hidden">Back</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Center Command & Tool Hub (Desktop) */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="hidden xl:flex items-center gap-2"
          >
            {/* Quick Command / Search Bar Trigger */}
            <button
              id="btn-nav-search"
              onClick={() => {
                onNavigateAuth("app");
                onTabChange("chat");
              }}
              title="Search clauses, definitions, or ask AI question (⌘K)"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer shadow-inner w-44 xl:w-56 ${
                isDark
                  ? "bg-neutral-900/90 hover:bg-neutral-850 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
                  : "bg-blue-700/70 hover:bg-blue-800 border-blue-500/60 hover:border-blue-400 text-blue-100 hover:text-white"
              }`}
            >
              <Search className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-blue-200"}`} />
              <span className={`truncate ${isDark ? "text-neutral-400" : "text-blue-100"}`}>Search clauses or ask AI...</span>
              <kbd
                className={`ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                  isDark
                    ? "bg-neutral-800 text-neutral-400 border-neutral-700"
                    : "bg-blue-800 text-blue-200 border-blue-500/50"
                }`}
              >
                ⌘K
              </kbd>
            </button>

            {/* Quick Upload Action */}
            {currentAuthView === "app" && (
              <button
                type="button"
                onClick={onOpenUploadModal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm border transition-all cursor-pointer shrink-0 hover:scale-[1.02] ${
                  isDark
                    ? "bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50 hover:shadow-indigo-500/25"
                    : "bg-blue-500 hover:bg-blue-400 border-blue-400/60 hover:shadow-blue-900/30"
                }`}
                title="Upload PDF, DOCX, or scan document"
              >
                <UploadCloud className="w-3.5 h-3.5 text-white" />
                <span>Upload</span>
              </button>
            )}

            {/* Export PDF Button */}
            {onOpenExportModal && currentAuthView === "app" && (
              <button
                type="button"
                id="btn-nav-export-pdf"
                onClick={onOpenExportModal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shrink-0 hover:scale-[1.02] ${
                  isDark
                    ? "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white"
                    : "bg-blue-700/70 hover:bg-blue-800 border-blue-500/60 hover:border-blue-400 text-white"
                }`}
                title="Export formatted analysis & attorney consultation brief to PDF"
              >
                <FileDown className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-blue-200"}`} />
                <span>Export PDF</span>
              </button>
            )}

            {/* Legal Glossary Quick Tool */}
            <button
              onClick={onOpenGlossaryModal}
              className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shrink-0 hover:scale-[1.02] ${
                isDark
                  ? "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white"
                  : "bg-blue-700/70 hover:bg-blue-800 border-blue-500/60 hover:border-blue-400 text-white"
              }`}
              title="Browse Legal Term Glossary"
            >
              <BookOpen className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-blue-200"}`} />
              <span>Glossary</span>
            </button>
          </motion.div>

          {/* Right Controls: Notifications, Status, Theme, Auth, Mobile Menu */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1 sm:gap-2 shrink-0"
          >
            {/* Search trigger on tablet/desktop */}
            <button
              onClick={() => {
                onNavigateAuth("app");
                onTabChange("chat");
              }}
              title="Search clauses or ask question"
              className={`hidden md:flex p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                isDark
                  ? "text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800"
                  : "text-blue-100 hover:text-white bg-blue-700/70 hover:bg-blue-800 border-blue-500/60"
              }`}
            >
              <Search className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? "text-indigo-400" : "text-white"}`} />
            </button>

            {/* AI Engine Status & Notifications Popover (hidden on mobile, visible on sm+) */}
            <div className="relative hidden sm:block">
              <button
                id="btn-nav-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                title="AI Verification & Grounding Status"
                className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer relative ${
                  isDark
                    ? "text-neutral-400 hover:text-white bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800"
                    : "text-blue-100 hover:text-white bg-blue-700/70 hover:bg-blue-800 border-blue-500/60"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-black" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-76 bg-neutral-950 text-neutral-200 rounded-2xl p-4 shadow-2xl border border-neutral-800 z-50 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-800">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      AI Grounding Engine
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                    </span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed text-[11px]">
                    Gemini 2.5 multimodal reasoning active with strict document grounding. Real-time clause cross-referencing and zero hallucination guardrails.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400 font-medium">Display Workspace</span>
                    <button
                      type="button"
                      onClick={() => {
                        toggleFullscreen();
                        setShowNotifications(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      <span>{isFullscreen ? "Exit Full Screen" : "Open Full Screen"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle (Desktop dual button, Mobile single button) */}
            <div
              id="btn-theme-toggle"
              role="radiogroup"
              aria-label="Color Theme Switcher"
              className={`hidden sm:flex items-center p-0.5 rounded-xl border shadow-inner select-none transition-colors ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-blue-800/80 border-blue-500/60"
              }`}
            >
              <button
                type="button"
                id="btn-theme-light"
                role="radio"
                aria-checked={!isDark}
                onClick={() => {
                  if (isDark) toggleTheme();
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isDark
                    ? "bg-white text-blue-900 shadow-xs font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
                title="Light Theme"
              >
                <Sun className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500 fill-amber-400/80" : "text-neutral-500"}`} />
              </button>

              <button
                type="button"
                id="btn-theme-dark"
                role="radio"
                aria-checked={isDark}
                onClick={() => {
                  if (!isDark) toggleTheme();
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isDark
                    ? "bg-neutral-800 text-indigo-300 shadow-xs border border-indigo-500/40 font-bold"
                    : "text-blue-200 hover:text-white"
                }`}
                title="Dark Theme"
              >
                <Moon className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400 fill-indigo-400/30" : "text-neutral-500"}`} />
              </button>
            </div>

            {/* Single button theme toggle on mobile to save horizontal space */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`sm:hidden p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isDark
                  ? "bg-neutral-900 border-neutral-800 text-neutral-300"
                  : "bg-blue-700/80 border-blue-500/60 text-white"
              }`}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-100" />}
            </button>

            {/* AUTHENTICATION CONTROLS */}
            {currentUser ? (
              /* LOGGED IN USER CONTROLS */
              <div className={`flex items-center gap-1.5 sm:gap-2 pl-1 sm:border-l ${isDark ? "sm:border-neutral-800" : "sm:border-blue-500/60"}`}>
                {/* Switch to Login / Sign Up options even when logged in */}
                <div className="hidden lg:flex items-center gap-1 pr-1 border-r border-neutral-800 dark:border-neutral-800">
                  <button
                    onClick={() => onNavigateAuth("login")}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      isDark
                        ? "text-neutral-300 hover:text-white hover:bg-neutral-800"
                        : "text-blue-100 hover:text-white hover:bg-blue-700/80"
                    }`}
                    title="Switch to another user or login"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={() => onNavigateAuth("signup")}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isDark
                        ? "text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50"
                        : "text-blue-800 bg-white hover:bg-blue-50 shadow-2xs"
                    }`}
                    title="Create a new account"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Sign Up</span>
                  </button>
                </div>

                {/* Dashboard Nav Button */}
                <button
                  onClick={() => onNavigateAuth("dashboard")}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentAuthView === "dashboard"
                      ? isDark ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-blue-900 shadow-sm"
                      : isDark ? "text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800" : "text-blue-100 hover:text-white hover:bg-blue-700 border border-transparent"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                {/* My Documents Nav Button */}
                <button
                  onClick={() => onNavigateAuth("documents")}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentAuthView === "documents"
                      ? isDark ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-blue-900 shadow-sm"
                      : isDark ? "text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800" : "text-blue-100 hover:text-white hover:bg-blue-700 border border-transparent"
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>My Documents</span>
                </button>

                {/* User Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2.5 rounded-xl border transition-all cursor-pointer text-white ${
                      isDark
                        ? "bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800"
                        : "bg-blue-700/80 hover:bg-blue-800 border-blue-500/60"
                    }`}
                  >
                    {/* Profile Photo / Initials */}
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-indigo-900 to-indigo-700 flex items-center justify-center text-white shrink-0 border border-indigo-400/30">
                      {userProfile?.profilePhotoURL ? (
                        <img
                          src={userProfile.profilePhotoURL}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-200">{initials}</span>
                      )}
                    </div>

                    <span className="hidden md:inline text-xs font-bold text-white max-w-[110px] truncate">
                      {displayName}
                    </span>

                    <ChevronDown className="w-3.5 h-3.5 text-blue-200 dark:text-neutral-400 shrink-0 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-neutral-950 rounded-2xl py-2 shadow-2xl border border-neutral-800 z-50 text-xs animate-in fade-in duration-150">
                      <div className="px-3.5 py-2 border-b border-neutral-800">
                        <div className="font-bold text-white truncate">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {currentUser.email}
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("profile");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer text-left font-medium"
                        >
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("dashboard");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer text-left font-medium"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("documents");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer text-left font-medium"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>My Documents</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("settings");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer text-left font-medium"
                        >
                          <Settings className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Settings</span>
                        </button>

                        <div className="border-t border-neutral-800 my-1" />

                        {/* Direct Log In & Sign Up Options inside User Menu */}
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("login");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-400 hover:bg-indigo-950/40 hover:text-indigo-300 transition-colors cursor-pointer text-left font-semibold"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Switch User / Log In</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("signup");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors cursor-pointer text-left font-semibold"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Create Account / Sign Up</span>
                        </button>

                        <div className="border-t border-neutral-800 my-1" />

                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer text-left font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* LOGGED OUT CONTROLS: LOGIN & SIGN UP - ALWAYS VISIBLE */
              <div className={`flex items-center gap-1.5 sm:gap-2 pl-1 sm:border-l shrink-0 ${isDark ? "sm:border-neutral-800" : "sm:border-blue-500/60"}`}>
                <MagneticButton
                  id="btn-nav-login"
                  type="button"
                  onClick={() => onNavigateAuth("login")}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 shrink-0 border ${
                    currentAuthView === "login"
                      ? isDark
                        ? "bg-neutral-800 text-white border-neutral-700 shadow-xs"
                        : "bg-white text-blue-900 border-white shadow-sm font-black"
                      : isDark
                        ? "text-neutral-200 hover:bg-neutral-800 hover:text-white border-neutral-800"
                        : "text-white hover:bg-blue-700 border-blue-400/60"
                  }`}
                  title="Sign In to your account"
                >
                  <LogIn className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-white"}`} />
                  <span>Log In</span>
                </MagneticButton>

                <MagneticButton
                  id="btn-nav-signup"
                  type="button"
                  onClick={() => onNavigateAuth("signup")}
                  className={`inline-flex px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer items-center gap-1 sm:gap-1.5 shadow-sm shrink-0 border ${
                    currentAuthView === "signup"
                      ? isDark
                        ? "bg-indigo-500 text-white border-indigo-400 ring-2 ring-indigo-400/40"
                        : "bg-white text-blue-950 border-white ring-2 ring-white/60 font-black shadow-md"
                      : isDark
                        ? "text-white bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50 hover:shadow-indigo-500/25"
                        : "text-blue-800 bg-white hover:bg-blue-50 border-transparent shadow-md shadow-blue-950/20"
                  }`}
                  title="Create a new Legal Navigator account"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </MagneticButton>
              </div>
            )}

            {/* Full Screen View Mode Button */}
            <button
              id="btn-fullscreen-toggle"
              type="button"
              aria-label={isFullscreen ? "Exit Full Screen View Mode" : "Enter Full Screen View Mode"}
              title={isFullscreen ? "Exit Full Screen View Mode (Esc)" : "Open Full Screen View Mode"}
              onClick={toggleFullscreen}
              className={`min-w-[38px] min-h-[38px] p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all border shrink-0 ${
                isFullscreen
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/30"
                  : isDark
                    ? "text-neutral-300 hover:text-white bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                    : "text-white bg-blue-700/80 hover:bg-blue-800 border-blue-500/60"
              }`}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-white" />
              ) : (
                <Maximize2 className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-white"}`} />
              )}
            </button>
          </motion.div>
        </div>

        {/* Mobile Full-Width Active Document Selector Strip */}
        {currentAuthView === "app" && (
          <div className={`sm:hidden py-2 border-b flex items-center justify-between gap-2 ${
            isDark ? "border-neutral-800/80" : "border-blue-500/60"
          }`}>
            <button
              type="button"
              id="btn-document-selector-mobile"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold rounded-xl border shadow-2xs transition-all cursor-pointer min-h-[38px] text-left ${
                isDark
                  ? "text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800"
                  : "text-white bg-blue-700/80 hover:bg-blue-800 border-blue-500/60"
              }`}
            >
              <div className="flex items-center gap-2 truncate min-w-0">
                <Download className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-indigo-400" : "text-white"}`} />
                <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${isDark ? "text-indigo-400" : "text-blue-200"}`}>Formats:</span>
                <span className="truncate font-bold text-white text-xs">
                  Legal Formats Download (PDF &bull; DOC)
                </span>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold shrink-0 pl-1 ${isDark ? "text-indigo-400" : "text-blue-200"}`}>
                <span>Download</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>

            <MagneticButton
              type="button"
              onClick={onOpenUploadModal}
              title="Upload & Detect New Document"
              className={`px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shrink-0 min-h-[38px] shadow-xs cursor-pointer transition-colors ${
                isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-blue-500 hover:bg-blue-400"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload &amp; Detect</span>
            </MagneticButton>
          </div>
        )}

        {/* Legal Document Formats & Download Center Popover Dropdown */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-2xs"
              onClick={() => setDropdownOpen(false)}
            />
            <div
              id="dropdown-document-presets"
              className="fixed sm:absolute left-2 right-2 sm:left-4 sm:right-auto top-24 sm:top-14 max-w-lg sm:w-[480px] bg-neutral-950 text-neutral-100 rounded-2xl p-3 z-50 shadow-2xl border border-neutral-800 animate-in fade-in zoom-in-95 duration-150 max-h-[82vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-800/90">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Download className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">
                      Legal Document Formats Library
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Standard templates ready to download in PDF, Word (DOC), or TXT
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
                  title="Close download center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Download Feedback Notification */}
              {downloadFeedback && (
                <div className="mb-2.5 px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium truncate">{downloadFeedback}</span>
                </div>
              )}

              {/* Formats Category Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mb-2 text-[11px]">
                {["all", "Lease", "Employment", "SaaS & Tech", "Freelance", "Confidentiality (NDA)", "Invoice"].map((cat) => {
                  const label = cat === "all" ? "All Formats" : cat;
                  const isCatActive = formatCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormatCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isCatActive
                          ? "bg-blue-600 text-white font-bold"
                          : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Formats List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
                {sampleDocuments
                  .filter((doc) => formatCategoryFilter === "all" || doc.category.toLowerCase().includes(formatCategoryFilter.toLowerCase()))
                  .map((doc) => {
                    const isCurrent = currentDocumentId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isCurrent
                            ? "bg-neutral-900/90 border-blue-500/50 ring-1 ring-blue-500/20"
                            : "bg-neutral-900/50 hover:bg-neutral-900 border-neutral-800/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-white leading-tight">
                                {doc.title}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                  Loaded
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                              {doc.description}
                            </p>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 shrink-0">
                            {doc.category}
                          </span>
                        </div>

                        {/* Format Download Actions */}
                        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-neutral-800/60 mt-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mr-1">
                              Download:
                            </span>

                            {/* PDF Download Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadFormat(doc, "pdf")}
                              title={`Download ${doc.title} as formatted PDF`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/60 transition-colors cursor-pointer"
                            >
                              <FileDown className="w-3 h-3 text-rose-400" />
                              <span>PDF</span>
                            </button>

                            {/* Word DOC Download Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadFormat(doc, "doc")}
                              title={`Download ${doc.title} as Microsoft Word Document (.doc)`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-950/70 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800/60 transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-blue-400" />
                              <span>DOC</span>
                            </button>

                            {/* Plaintext TXT Download Button */}
                            <button
                              type="button"
                              onClick={() => handleDownloadFormat(doc, "txt")}
                              title={`Download ${doc.title} as Plaintext (.txt)`}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                              <span>TXT</span>
                            </button>
                          </div>

                          {/* Load into Workspace Action */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSampleDocument(doc);
                              setDropdownOpen(false);
                            }}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                              isCurrent
                                ? "text-blue-400 hover:underline"
                                : "text-neutral-300 hover:text-white hover:bg-neutral-800"
                            }`}
                          >
                            {isCurrent ? "Active In App" : "Open In App"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Strip: Custom Upload */}
              <div className="border-t border-neutral-800 mt-2.5 pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenUploadModal();
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-colors cursor-pointer flex items-center gap-1"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Custom Document to Export / Format</span>
                </button>
                <span className="text-[10px] text-neutral-500">6 Verified Formats</span>
              </div>
            </div>
          </>
        )}

        {/* Mobile Full Slide-over Drawer when open */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 pb-safe animate-in slide-in-from-bottom-8 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Navigation &amp; Controls
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close Mobile Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Top Mobile Auth Action Banner (Always visible at top of mobile menu) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-indigo-950/60 dark:to-neutral-900 border border-indigo-200 dark:border-indigo-900/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{currentUser ? `Signed in as ${displayName}` : "Legal Account Access"}</span>
                  </div>
                  {currentUser && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateAuth("login");
                    }}
                    className="flex-1 min-h-[42px] py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-50 shadow-2xs cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{currentUser ? "Switch / Log In" : "Log In"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateAuth("signup");
                    }}
                    className="flex-1 min-h-[42px] py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{currentUser ? "New Account" : "Sign Up"}</span>
                  </button>
                </div>
              </div>

              {/* Document Info & Switcher Button */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 dark:bg-[#151c2e] border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Document
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {documentTitle}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setDropdownOpen(true);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 hover:underline px-2 py-1"
                  >
                    Switch
                  </button>
                </div>
              </div>

              {/* App Views List */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                  Navigator Views
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentAuthView === "app" && activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("app");
                          onTabChange(item.id);
                        }}
                        className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-left transition-colors cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[8px] font-bold px-1 rounded ml-auto ${
                            isActive ? "bg-white text-indigo-600" : "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-300"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tools & Utilities */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenGlossaryModal();
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Legal Glossary</span>
                </button>

                {onOpenExportModal && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenExportModal();
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-indigo-500" />
                    <span>Export PDF</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-fullscreen-toggle-mobile"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    toggleFullscreen();
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-indigo-500" /> : <Maximize2 className="w-4 h-4 text-indigo-500" />}
                  <span>{isFullscreen ? "Exit Full Screen Mode" : "Open Page on Full Screen"}</span>
                </button>
              </div>

              {/* User Account Controls */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                {currentUser ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 px-1 text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {displayName}
                      </span>
                      <span>&bull;</span>
                      <span className="truncate">{currentUser.email}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("dashboard");
                        }}
                        className="min-h-[44px] p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-center flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("documents");
                        }}
                        className="min-h-[44px] p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-center flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>My Documents</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("profile");
                        }}
                        className="min-h-[44px] p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-center flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("settings");
                        }}
                        className="min-h-[44px] p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-center flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("login");
                        }}
                        className="min-h-[44px] p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Switch / Log In</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("signup");
                        }}
                        className="min-h-[44px] p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create / Sign Up</span>
                      </button>
                    </div>

                    <button
                      onClick={handleLogoutClick}
                      className="w-full min-h-[44px] p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(currentAuthView === "login" || currentAuthView === "signup" || currentAuthView === "forgot-password") && (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("app");
                          onTabChange("overview");
                        }}
                        className="w-full min-h-[44px] py-2 rounded-xl bg-neutral-900 text-neutral-200 hover:text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-neutral-800 shadow-xs cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Back to Document Navigator</span>
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("login");
                        }}
                        className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentAuthView === "login"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200"
                        }`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Log In</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onNavigateAuth("signup");
                        }}
                        className={`flex-1 min-h-[44px] py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                          currentAuthView === "signup"
                            ? "bg-indigo-600 text-white ring-2 ring-indigo-400/40"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Sign Up</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tier 2: Secondary Navigation (Desktop scrollable bar) */}
        {currentAuthView === "app" && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className={`flex items-center justify-between py-2 overflow-x-auto no-scrollbar touch-pan-x border-t transition-colors ${
              isDark ? "border-neutral-900/90" : "border-blue-500/50"
            }`}
          >
            <nav
              aria-label="Secondary Navigation Tabs"
              onMouseLeave={() => setHoveredTab(null)}
              className="flex items-center gap-1 sm:gap-2 px-1"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isHovered = hoveredTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    onMouseEnter={() => setHoveredTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? "text-white font-bold"
                        : isDark
                          ? "text-neutral-400 hover:text-white"
                          : "text-blue-100 hover:text-white"
                    }`}
                  >
                    {/* Active Tab Background Pill & Luminous Underline */}
                    {isActive && (
                      <>
                        <motion.div
                          layoutId="activeTabPill"
                          className={`absolute inset-0 rounded-xl shadow-md -z-10 ${
                            isDark
                              ? "bg-indigo-600 shadow-indigo-900/50"
                              : "bg-blue-800 shadow-blue-950/40 ring-1 ring-white/30"
                          }`}
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                        <motion.div
                          layoutId="activeTabUnderline"
                          className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      </>
                    )}

                    {/* Smooth Navigation Tab Hover Underline & Backdrop transitioning between tabs */}
                    {isHovered && !isActive && !shouldReduceMotion && (
                      <>
                        <motion.div
                          layoutId="hoverTabBackdrop"
                          className={`absolute inset-0 rounded-xl -z-10 ${
                            isDark ? "bg-white/[0.08]" : "bg-white/[0.18]"
                          }`}
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                        <motion.div
                          layoutId="hoverTabUnderline"
                          className="absolute -bottom-1 left-2.5 right-2.5 h-[2px] bg-gradient-to-r from-sky-300 via-cyan-300 to-indigo-300 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.7)]"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      </>
                    )}

                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        isActive
                          ? "bg-amber-400 text-slate-950 font-bold"
                          : isDark
                            ? "bg-neutral-800 text-amber-300 border border-amber-500/30"
                            : "bg-blue-800 text-amber-300 border border-amber-400/40"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Legal Terms Glossary quick button */}
            <button
              id="btn-open-glossary"
              onClick={onOpenGlossaryModal}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer hover:scale-[1.02] ${
                isDark
                  ? "text-neutral-300 hover:text-white bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800"
                  : "text-white bg-blue-700/70 hover:bg-blue-800 border-blue-500/60"
              }`}
              title="Browse Legal Term Glossary"
            >
              <BookOpen className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400" : "text-blue-200"}`} />
              <span>Glossary</span>
            </button>
          </motion.div>
        )}
      </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Phone viewports) */}
      {currentAuthView === "app" && (
        <nav
          aria-label="Mobile Navigation"
          className="sm:hidden fixed bottom-0 left-0 right-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] px-2 pb-safe"
          style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        >
          <div className="flex items-center justify-around h-14">
            {/* 1. Overview */}
            <button
              onClick={() => onTabChange("overview")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                activeTab === "overview"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            {/* 2. Clauses */}
            <button
              onClick={() => onTabChange("clauses")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                activeTab === "clauses"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Clauses</span>
            </button>

            {/* 3. Obligations */}
            <button
              onClick={() => onTabChange("obligations")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors ${
                activeTab === "obligations"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Duties</span>
            </button>

            {/* 4. Q&A */}
            <button
              onClick={() => onTabChange("chat")}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors relative ${
                activeTab === "chat"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI</span>
            </button>

            {/* 5. More Menu Sheet */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex-1 min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>More</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};
