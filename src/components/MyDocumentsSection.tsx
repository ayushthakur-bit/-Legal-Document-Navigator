import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Search,
  UploadCloud,
  Trash2,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useUserDocuments } from "../context/UserDocumentsContext";
import { UserDocumentRecord, AuthPageView } from "../types";

interface MyDocumentsSectionProps {
  onNavigate: (view: AuthPageView) => void;
  onOpenDocumentInNavigator: (docRecord: UserDocumentRecord) => void;
  onOpenUploadModal: () => void;
}

export const MyDocumentsSection: React.FC<MyDocumentsSectionProps> = ({
  onNavigate,
  onOpenDocumentInNavigator,
  onOpenUploadModal,
}) => {
  const { currentUser } = useAuth();
  const { userDocuments, deleteUserDocument, isLoadingDocs } = useUserDocuments();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "RECENT" | "ANALYZED">("ALL");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return userDocuments.filter((doc) => {
      // Search filter
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === "ANALYZED") {
        return doc.status === "ANALYZED";
      }
      if (statusFilter === "RECENT") {
        // Last 7 days
        const docDate = new Date(doc.uploadedAt || 0).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return docDate >= sevenDaysAgo;
      }

      return true;
    });
  }, [userDocuments, searchQuery, statusFilter]);

  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this document from your cloud workspace?")) {
      setIsDeletingId(docId);
      try {
        await deleteUserDocument(docId);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeletingId(null);
      }
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              My Documents
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {userDocuments.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cloud-synced legal agreements and analysis results isolated to your private account.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md hover:shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name or clause..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {(["ALL", "RECENT", "ANALYZED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {filter === "ALL" ? "All" : filter === "RECENT" ? "Recent" : "Analyzed"}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List / Table */}
      {isLoadingDocs ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Loading your cloud documents...
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-8 sm:p-12 text-center glass-panel rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {searchQuery ? "No matching documents found" : "No documents stored yet"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any contracts matching "${searchQuery}". Try a different keyword.`
              : "Upload your legal agreements or contracts to keep them safely analyzed in your private cloud account."}
          </p>
          {!searchQuery && (
            <div className="pt-2">
              <button
                onClick={onOpenUploadModal}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload First Document</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((docItem) => {
            const isDeleting = isDeletingId === docItem.id;

            return (
              <motion.div
                key={docItem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between space-y-3 group shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 truncate max-w-[140px]">
                      {docItem.fileType}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(docItem.uploadedAt)}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {docItem.fileName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Analyzed
                        </span>
                        {docItem.analysis?.riskScore !== undefined && (
                          <span className="text-[10px] text-slate-400">
                            &bull; Risk: {docItem.analysis.riskScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {docItem.summary || "Full legal analysis saved and ready for interactive consultation."}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenDocumentInNavigator(docItem)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, docItem.id)}
                    disabled={isDeleting}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete document"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
