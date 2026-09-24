import React, { useState } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";
import { SampleDocument, AuthPageView } from "../types";
import { useTheme } from "../context/ThemeContext";
import { useRecentDocuments } from "../context/RecentDocumentsContext";
import { useAuth } from "../context/AuthContext";

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

  const { isDark, toggleTheme } = useTheme();
  const { recentDocuments, removeRecentDocument, formatTimeAgo } = useRecentDocuments();
  const { currentUser, userProfile, logout, formatInitials } = useAuth();

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
    <header className="sticky top-0 z-40 glass-panel border-x-0 border-t-0 shadow-xs">
      {/* Tier 1: Brand, Document Selector, Actions & Theme Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-200/60 dark:border-slate-800/80">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                onNavigateAuth("app");
                onTabChange("overview");
              }}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-indigo-400 flex items-center justify-center shadow-md border border-white/20 dark:border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                    Legal Document Navigator
                  </h1>
                </div>
                <p className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mt-0.5">
                  AI Legal Assistant
                </p>
              </div>
            </button>

            {/* Document Selector Dropdown (When on App Navigator view) */}
            {currentAuthView === "app" && (
              <div className="relative ml-2 sm:ml-4 hidden md:block">
                <button
                  id="btn-document-selector"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer max-w-[220px] border border-slate-200 dark:border-slate-700/80 hover:scale-[1.02] active:scale-[0.98]"
                  title="Switch active document or template"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{documentTitle || "Select Document"}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
                </button>

                {dropdownOpen && (
                  <div
                    id="dropdown-document-presets"
                    className="absolute left-0 mt-2 w-80 glass-panel-elevated rounded-2xl py-2 z-50 shadow-2xl border border-slate-200/80 dark:border-slate-700/80 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto"
                  >
                    {/* Recently Analyzed Section */}
                    {recentDocuments.length > 0 && (
                      <div className="mb-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                        <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            <span>Recently Analyzed ({recentDocuments.length})</span>
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                            <span>Instant</span>
                          </span>
                        </div>

                        <div className="space-y-0.5 px-1.5 mt-1">
                          {recentDocuments.map((item) => {
                            const isActive =
                              currentDocumentId === item.id || currentDocumentId === item.document.id;
                            const isInvoice =
                              item.document.category === "Invoice" ||
                              item.document.title.toLowerCase().includes("invoice");

                            return (
                              <div
                                key={item.id}
                                id={`nav-recent-${item.id}`}
                                onClick={() => {
                                  onSelectSampleDocument(item.document);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer group ${
                                  isActive
                                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 font-semibold"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-1">
                                  {isInvoice ? (
                                    <Receipt className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                  )}
                                  <div className="truncate">
                                    <div className="truncate font-semibold text-slate-900 dark:text-white leading-tight">
                                      {item.document.title}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                      <span>{formatTimeAgo(item.analyzedAt)}</span>
                                      <span>&bull;</span>
                                      <span className="truncate">{item.document.category}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {item.analysis?.riskScore !== undefined && (
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        item.analysis.riskScore >= 70
                                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                                          : item.analysis.riskScore >= 40
                                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                      }`}
                                    >
                                      {item.analysis.riskScore}%
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    title="Remove from history"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeRecentDocument(item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Curated Legal Presets
                    </div>
                    <div className="space-y-0.5 px-1.5">
                      {sampleDocuments.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            onSelectSampleDocument(doc);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-start gap-2.5 transition-colors cursor-pointer ${
                            currentDocumentId === doc.id
                              ? "glass-indigo text-indigo-950 dark:text-indigo-200 font-semibold"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <div className="font-semibold text-slate-900 dark:text-white leading-snug truncate">
                              {doc.title}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {doc.tag}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-200/60 dark:border-slate-700/60 mt-2 pt-1.5 px-2">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenUploadModal();
                        }}
                        className="w-full text-center py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                      >
                        + Paste or Upload Custom Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: Auth Items, Search, Notifications, Theme, Upload */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search trigger */}
            <button
              id="btn-nav-search"
              onClick={() => {
                onNavigateAuth("app");
                onTabChange("chat");
              }}
              title="Search clauses or ask question"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer hover:scale-[1.04]"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                id="btn-nav-notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                title="AI Verification Status"
                className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer relative hover:scale-[1.04]"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 glass-panel-elevated rounded-2xl p-4 shadow-xl border border-slate-200/80 dark:border-slate-700/80 z-50 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">AI Engine Status</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live Ready
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Gemini Multimodal reasoning active. Strict document grounding with zero external speculation.
                  </p>
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle */}
            <div
              id="btn-theme-toggle"
              role="radiogroup"
              aria-label="Color Theme Switcher"
              className="flex items-center p-0.5 rounded-xl bg-slate-200/90 dark:bg-slate-850 dark:bg-[#121927] border border-slate-300/80 dark:border-slate-700/80 shadow-inner select-none transition-colors"
            >
              <button
                type="button"
                id="btn-theme-light"
                role="radio"
                aria-checked={!isDark}
                onClick={() => {
                  if (isDark) toggleTheme();
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isDark
                    ? "bg-white text-amber-700 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                title="Light Theme"
              >
                <Sun className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500 fill-amber-400/80" : "text-slate-400"}`} />
              </button>

              <button
                type="button"
                id="btn-theme-dark"
                role="radio"
                aria-checked={isDark}
                onClick={() => {
                  if (!isDark) toggleTheme();
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isDark
                    ? "bg-slate-900 text-indigo-300 shadow-xs border border-indigo-500/40 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                title="Dark Theme"
              >
                <Moon className={`w-3.5 h-3.5 ${isDark ? "text-indigo-400 fill-indigo-400/30" : "text-slate-400"}`} />
              </button>
            </div>

            {/* Export PDF Button */}
            {onOpenExportModal && currentAuthView === "app" && (
              <button
                type="button"
                id="btn-nav-export-pdf"
                onClick={onOpenExportModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl glass-subtle hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-700/80 text-indigo-700 dark:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-xs transition-all cursor-pointer"
                title="Export formatted analysis & attorney consultation brief to PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Export PDF</span>
              </button>
            )}

            {/* AUTHENTICATION CONTROLS */}
            {currentUser ? (
              /* LOGGED IN USER CONTROLS */
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200/80 dark:border-slate-800">
                {/* Dashboard Nav Button */}
                <button
                  onClick={() => onNavigateAuth("dashboard")}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentAuthView === "dashboard"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>

                {/* My Documents Nav Button */}
                <button
                  onClick={() => onNavigateAuth("documents")}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentAuthView === "documents"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>My Documents</span>
                </button>

                {/* User Dropdown Trigger */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer"
                  >
                    {/* Profile Photo / Initials */}
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center text-white shrink-0 border border-white/20">
                      {userProfile?.profilePhotoURL ? (
                        <img
                          src={userProfile.profilePhotoURL}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-indigo-300">{initials}</span>
                      )}
                    </div>

                    <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                      {displayName}
                    </span>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-panel-elevated rounded-2xl py-2 shadow-2xl border border-slate-200/80 dark:border-slate-700/80 z-50 text-xs">
                      <div className="px-3.5 py-2 border-b border-slate-200/60 dark:border-slate-800">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {currentUser.email}
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("profile");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left font-medium"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("dashboard");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left font-medium"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("documents");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left font-medium"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>My Documents</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onNavigateAuth("settings");
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left font-medium"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings</span>
                        </button>

                        <div className="border-t border-slate-200/60 dark:border-slate-800 my-1" />

                        <button
                          onClick={handleLogoutClick}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer text-left font-bold"
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
              /* LOGGED OUT CONTROLS: LOGIN & SIGN UP */
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200/80 dark:border-slate-800">
                <button
                  onClick={() => onNavigateAuth("login")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentAuthView === "login"
                      ? "bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>

                <button
                  onClick={() => onNavigateAuth("signup")}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-indigo-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown when open */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 border-b border-slate-200/60 dark:border-slate-800 space-y-2">
            {currentUser ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("dashboard");
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-center"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("documents");
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-center"
                >
                  My Documents
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("profile");
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-center"
                >
                  Profile
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-center"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("login");
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateAuth("signup");
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tier 2: Secondary Navigation (Only shown when viewing Legal Document Navigator App) */}
        {currentAuthView === "app" && (
          <div className="flex items-center justify-between py-2 overflow-x-auto no-scrollbar">
            <nav aria-label="Secondary Navigation Tabs" className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? "text-white dark:text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-slate-900 dark:bg-indigo-600 rounded-xl shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        isActive ? "bg-amber-400 text-slate-950" : "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300"
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
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer hover:scale-[1.02]"
              title="Browse Legal Term Glossary"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Glossary</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
