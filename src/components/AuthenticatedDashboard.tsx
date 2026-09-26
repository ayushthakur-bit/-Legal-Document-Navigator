import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FileText,
  UploadCloud,
  MessageSquare,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  ChevronRight,
  Receipt,
  FileCheck2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUserDocuments } from "../context/UserDocumentsContext";
import { AuthPageView, UserDocumentRecord } from "../types";
import { AnimatedCounter } from "./AnimatedCounter";

interface AuthenticatedDashboardProps {
  onNavigate: (view: AuthPageView) => void;
  onOpenDocumentInNavigator: (docRecord: UserDocumentRecord) => void;
  onOpenUploadModal: () => void;
  onSwitchToAskAI: () => void;
}

export const AuthenticatedDashboard: React.FC<AuthenticatedDashboardProps> = ({
  onNavigate,
  onOpenDocumentInNavigator,
  onOpenUploadModal,
  onSwitchToAskAI,
}) => {
  const { userProfile, currentUser } = useAuth();
  const { userDocuments, deleteUserDocument, isLoadingDocs } = useUserDocuments();

  const firstName = React.useMemo(() => {
    if (userProfile?.fullName) {
      return userProfile.fullName.trim().split(" ")[0];
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "Counselor";
  }, [userProfile, currentUser]);

  // Statistics
  const totalDocuments = userDocuments.length;
  const analyzedDocuments = userDocuments.filter((d) => d.status === "ANALYZED").length;
  const recentDocumentsCount = Math.min(totalDocuments, 3);

  // Recent 3 documents
  const recentDocuments = userDocuments.slice(0, 3);

  // Format relative timestamp
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel-elevated border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authenticated Workspace &bull; Firebase Verified</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Good morning, {firstName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Welcome back to Legal Document Navigator. Review your active contracts, run zero-speculation AI clause analysis, and prepare strategic attorney briefs.
          </p>
        </div>
      </div>

      {/* Statistics Cards with Count-Up Animations and Premium Card Hover */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Documents */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1 premium-card-hover">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Documents Stored</span>
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={totalDocuments} duration={900} />
          </div>
          <p className="text-[11px] text-slate-400">In private Firebase Firestore collection</p>
        </div>

        {/* Analyzed Documents */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1 premium-card-hover">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Analyzed by AI</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={analyzedDocuments} duration={1000} />
          </div>
          <p className="text-[11px] text-slate-400">Multi-factor risk &amp; clause breakdown</p>
        </div>

        {/* Recent Active */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1 premium-card-hover">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Recent Workspace</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            <AnimatedCounter value={recentDocumentsCount} duration={800} />
          </div>
          <p className="text-[11px] text-slate-400">Active session references</p>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onOpenUploadModal}
          className="p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-left space-y-2 shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <span>Upload Document</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-[11px] text-indigo-100 font-normal mt-0.5">
              Analyze PDF, image, or text contracts
            </p>
          </div>
        </button>

        <button
          onClick={onSwitchToAskAI}
          className="p-5 rounded-2xl glass-panel hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-900 dark:text-white font-bold text-left space-y-2 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <span>Ask Your Document</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Strict grounded Q&amp;A with page quotes
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("documents")}
          className="p-5 rounded-2xl glass-panel hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-900 dark:text-white font-bold text-left space-y-2 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <span>View My Documents</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Manage your saved legal documents
            </p>
          </div>
        </button>
      </div>

      {/* Recent Activity / Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity &amp; Documents
            </h3>
          </div>
          {totalDocuments > 0 && (
            <button
              onClick={() => onNavigate("documents")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              See all ({totalDocuments}) &rarr;
            </button>
          )}
        </div>

        {userDocuments.length === 0 ? (
          /* Empty State */
          <div className="p-8 sm:p-12 text-center glass-panel rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Your document workspace is empty
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Upload your first legal document to start analyzing risks, obligations, and navigating it with AI.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenUploadModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDocuments.map((docItem) => {
              const isInvoice =
                docItem.fileType === "Invoice" ||
                docItem.fileName.toLowerCase().includes("invoice");

              return (
                <div
                  key={docItem.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {docItem.fileType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatTime(docItem.uploadedAt)}
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      {isInvoice ? (
                        <Receipt className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {docItem.fileName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {docItem.summary || "Ready for AI navigation and risk assessment."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenDocumentInNavigator(docItem)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Document</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteUserDocument(docItem.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
