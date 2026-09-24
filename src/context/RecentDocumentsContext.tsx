import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { RecentDocumentRecord, SampleDocument, AnalysisResult, ComparisonResult, AttorneyBriefResult } from "../types";

const LOCAL_STORAGE_KEY = "legal_nav_recently_analyzed_docs_v1";
const MAX_RECENT_DOCS = 12;

interface RecentDocumentsContextType {
  recentDocuments: RecentDocumentRecord[];
  activeRecentId: string | null;
  setActiveRecentId: (id: string | null) => void;
  saveRecentAnalysis: (
    document: SampleDocument,
    analysis: AnalysisResult,
    comparisonResult?: ComparisonResult | null,
    attorneyBrief?: AttorneyBriefResult | null
  ) => void;
  updateRecentAuxiliary: (
    documentId: string,
    updates: { comparisonResult?: ComparisonResult | null; attorneyBrief?: AttorneyBriefResult | null }
  ) => void;
  getCachedRecord: (documentId: string, fullText?: string) => RecentDocumentRecord | null;
  removeRecentDocument: (id: string) => void;
  clearAllRecentDocuments: () => void;
  formatTimeAgo: (isoDate: string) => string;
}

const RecentDocumentsContext = createContext<RecentDocumentsContextType | undefined>(undefined);

// Helper to compute word count safely
function computeWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const RecentDocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentDocuments, setRecentDocuments] = useState<RecentDocumentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Failed to load recently analyzed documents from localStorage:", err);
    }
    return [];
  });

  const [activeRecentId, setActiveRecentId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentDocuments));
    } catch (err) {
      console.warn("Failed to persist recently analyzed documents to localStorage:", err);
    }
  }, [recentDocuments]);

  // Find a cached record by document id or text match
  const getCachedRecord = useCallback(
    (documentId: string, fullText?: string): RecentDocumentRecord | null => {
      // 1. Exact ID match
      const exact = recentDocuments.find((r) => r.id === documentId || r.document.id === documentId);
      if (exact) return exact;

      // 2. Full text match (for custom pasted/uploaded documents that might get re-uploaded)
      if (fullText && fullText.length > 50) {
        const trimmed = fullText.trim();
        const textMatch = recentDocuments.find((r) => r.document.fullText.trim() === trimmed);
        if (textMatch) return textMatch;
      }

      return null;
    },
    [recentDocuments]
  );

  // Save or update an analyzed document
  const saveRecentAnalysis = useCallback(
    (
      document: SampleDocument,
      analysis: AnalysisResult,
      comparisonResult?: ComparisonResult | null,
      attorneyBrief?: AttorneyBriefResult | null
    ) => {
      const wordCount = computeWordCount(document.fullText);
      const recordId = document.id;

      setRecentDocuments((prev) => {
        // Remove previous instance of this document if it exists
        const filtered = prev.filter(
          (r) => r.id !== recordId && r.document.id !== recordId && r.document.title !== document.title
        );

        const newRecord: RecentDocumentRecord = {
          id: recordId,
          document,
          analysis,
          analyzedAt: new Date().toISOString(),
          wordCount,
          comparisonResult: comparisonResult !== undefined ? comparisonResult : null,
          attorneyBrief: attorneyBrief !== undefined ? attorneyBrief : null,
        };

        const updated = [newRecord, ...filtered].slice(0, MAX_RECENT_DOCS);
        return updated;
      });

      setActiveRecentId(recordId);
    },
    []
  );

  // Update comparison or attorney brief on an already cached record
  const updateRecentAuxiliary = useCallback(
    (
      documentId: string,
      updates: { comparisonResult?: ComparisonResult | null; attorneyBrief?: AttorneyBriefResult | null }
    ) => {
      setRecentDocuments((prev) =>
        prev.map((item) => {
          if (item.id === documentId || item.document.id === documentId) {
            return {
              ...item,
              ...(updates.comparisonResult !== undefined ? { comparisonResult: updates.comparisonResult } : {}),
              ...(updates.attorneyBrief !== undefined ? { attorneyBrief: updates.attorneyBrief } : {}),
            };
          }
          return item;
        })
      );
    },
    []
  );

  // Remove a single document from history
  const removeRecentDocument = useCallback((id: string) => {
    setRecentDocuments((prev) => prev.filter((r) => r.id !== id && r.document.id !== id));
    setActiveRecentId((curr) => (curr === id ? null : curr));
  }, []);

  // Clear all recent documents
  const clearAllRecentDocuments = useCallback(() => {
    setRecentDocuments([]);
    setActiveRecentId(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear localStorage:", e);
    }
  }, []);

  // Format relative timestamp
  const formatTimeAgo = useCallback((isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 45) return "Just now";
      if (diffSec < 90) return "1m ago";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  }, []);

  return (
    <RecentDocumentsContext.Provider
      value={{
        recentDocuments,
        activeRecentId,
        setActiveRecentId,
        saveRecentAnalysis,
        updateRecentAuxiliary,
        getCachedRecord,
        removeRecentDocument,
        clearAllRecentDocuments,
        formatTimeAgo,
      }}
    >
      {children}
    </RecentDocumentsContext.Provider>
  );
};

export const useRecentDocuments = () => {
  const context = useContext(RecentDocumentsContext);
  if (!context) {
    throw new Error("useRecentDocuments must be used within a RecentDocumentsProvider");
  }
  return context;
};
