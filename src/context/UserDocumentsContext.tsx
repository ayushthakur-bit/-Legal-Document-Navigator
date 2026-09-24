import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";
import { UserDocumentRecord, AnalysisResult, ComparisonResult, AttorneyBriefResult } from "../types";

interface UserDocumentsContextType {
  userDocuments: UserDocumentRecord[];
  isLoadingDocs: boolean;
  saveUserDocument: (
    fileName: string,
    fileType: string,
    documentText: string,
    analysis?: AnalysisResult,
    comparisonResult?: ComparisonResult | null,
    attorneyBrief?: AttorneyBriefResult | null,
    existingDocId?: string
  ) => Promise<UserDocumentRecord>;
  deleteUserDocument: (docId: string) => Promise<void>;
  getUserDocument: (docId: string) => UserDocumentRecord | null;
  refreshUserDocuments: () => Promise<void>;
}

const UserDocumentsContext = createContext<UserDocumentsContextType | undefined>(undefined);

const DEFAULT_DEMO_DOCS: UserDocumentRecord[] = [
  {
    id: "demo-doc-1",
    userId: "demo-counselor-01",
    fileName: "Mutual Non-Disclosure Agreement (NDA).pdf",
    fileType: "Confidentiality & NDA",
    fileURL: "",
    status: "ANALYZED",
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    analyzedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    summary:
      "Standard bilateral commercial non-disclosure agreement governing proprietary software, intellectual property, and trade secrets with a 3-year term and Delaware governing law.",
    documentText:
      "MUTUAL NON-DISCLOSURE AGREEMENT\nThis Agreement is entered into by and between Alpha Corp and Beta Legal Advisory...",
    analysis: {
      summary:
        "Standard bilateral commercial non-disclosure agreement governing proprietary software, intellectual property, and trade secrets with a 3-year term and Delaware governing law.",
      overallRiskRating: "MODERATE",
      riskScore: 35,
      riskSummary: "Balanced bilateral terms with standard Delaware governing law.",
      readingGradeLevel: "College Graduate",
      simplifiedGradeLevel: "Grade 9",
      keyParties: ["Alpha Corp (Disclosing Party)", "Beta Legal Advisory (Receiving Party)"],
      keyClauses: [
        {
          clauseTitle: "Standard of Care and Confidentiality",
          originalSnippet: "Receiving Party shall treat all Information with the same degree of care it treats its own proprietary material.",
          plainEnglish: "You must safeguard confidential material as carefully as you protect your own valuable data.",
          riskLevel: "SAFE",
          whyItMatters: "Standard commercial benchmark for reasonable protection.",
          category: "Confidentiality",
        },
      ],
      obligations: [
        {
          party: "Both Parties",
          obligation: "Maintain strict confidentiality regarding proprietary source code and financial metrics.",
          deadlineOrTrigger: "3 years from date of disclosure",
          consequenceOfBreach: "Injunctive relief and actual direct monetary damages",
          isCrucial: true,
        },
      ],
      hiddenTrapsOrGotchas: [
        {
          title: "Residual Knowledge Clause",
          description: "Does not contain an explicit residual knowledge carveout for employees' unaided memories.",
          mitigationOrQuestion: "Request a standard residual memory clause to prevent accidental breach.",
        },
      ],
      keyDatesAndDeadlines: [
        {
          event: "Agreement Expiration",
          timeframe: "36 Months from Effective Date",
          actionRequired: "Return or certify destruction of all digital and physical documents.",
        },
      ],
      preSigningChecklist: [
        {
          id: "chk-1",
          item: "Confirm carveout for legally mandated court disclosures.",
          importance: "CRITICAL",
          category: "Exceptions",
          completed: true,
        },
      ],
      legalGlossary: [
        {
          term: "Injunctive Relief",
          plainDefinition: "A court order compelling a party to stop doing an unauthorized act immediately.",
        },
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "demo-doc-2",
    userId: "demo-counselor-01",
    fileName: "Executive Employment Agreement.pdf",
    fileType: "Employment & Labor",
    fileURL: "",
    status: "ANALYZED",
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    analyzedAt: new Date(Date.now() - 86400000).toISOString(),
    summary:
      "Senior leadership employment agreement establishing base compensation, equity vesting schedule, non-solicitation, and standard severance provisions.",
    documentText:
      "EXECUTIVE EMPLOYMENT AGREEMENT\nThis Executive Employment Agreement is made effective as of October 1, 2026...",
    analysis: {
      summary:
        "Senior leadership employment agreement establishing base compensation, equity vesting schedule, non-solicitation, and standard severance provisions.",
      overallRiskRating: "HIGH",
      riskScore: 72,
      riskSummary: "Aggressive non-compete perimeter and forfeiture clauses upon voluntary resignation.",
      readingGradeLevel: "Post-Graduate",
      simplifiedGradeLevel: "Grade 10",
      keyParties: ["Apex Technology Group (Employer)", "Executive Officer (Employee)"],
      keyClauses: [
        {
          clauseTitle: "Worldwide Non-Competition Covenant",
          originalSnippet: "Employee shall not engage in any competitive venture anywhere in the world for 24 months post termination.",
          plainEnglish: "You cannot work for any competitor anywhere in the world for two years after leaving.",
          riskLevel: "CRITICAL",
          whyItMatters: "May be legally unenforceable in certain jurisdictions or restrict career mobility.",
          category: "Restrictive Covenants",
        },
      ],
      obligations: [
        {
          party: "Executive",
          obligation: "Devote full commercial time and professional effort exclusively to Employer.",
          deadlineOrTrigger: "Ongoing during term of employment",
          consequenceOfBreach: "Termination for cause and forfeiture of unvested equity options",
          isCrucial: true,
        },
      ],
      hiddenTrapsOrGotchas: [
        {
          title: "Clawback on Resignation",
          description: "Signing bonus must be repaid in full if departure occurs within 18 months.",
          mitigationOrQuestion: "Negotiate a monthly pro-rata forgiveness schedule instead of a cliff.",
        },
      ],
      keyDatesAndDeadlines: [
        {
          event: "Equity Cliff Vesting",
          timeframe: "12 Months from Start Date",
          actionRequired: "Review stock option grant plan with accountant.",
        },
      ],
      preSigningChecklist: [
        {
          id: "chk-2",
          item: "Request limitation of non-compete to primary operating region.",
          importance: "CRITICAL",
          category: "Covenants",
          completed: false,
        },
      ],
      legalGlossary: [
        {
          term: "Termination for Cause",
          plainDefinition: "Firing an employee for gross negligence, criminal conviction, or intentional breach.",
        },
      ],
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const UserDocumentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoUser } = useAuth();
  const [userDocuments, setUserDocuments] = useState<UserDocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Fetch documents belonging strictly to authenticated user
  const fetchUserDocuments = useCallback(async () => {
    if (!currentUser) {
      setUserDocuments([]);
      return;
    }

    // Demo Mode handling
    if (isDemoUser || currentUser.uid.startsWith("demo-")) {
      setIsLoadingDocs(true);
      try {
        const local = localStorage.getItem("legal_navigator_demo_docs");
        if (local) {
          setUserDocuments(JSON.parse(local));
        } else {
          localStorage.setItem("legal_navigator_demo_docs", JSON.stringify(DEFAULT_DEMO_DOCS));
          setUserDocuments(DEFAULT_DEMO_DOCS);
        }
      } catch (e) {
        setUserDocuments(DEFAULT_DEMO_DOCS);
      } finally {
        setIsLoadingDocs(false);
      }
      return;
    }

    setIsLoadingDocs(true);
    try {
      // Query Enforcer adheres strictly to Firestore Security Rules:
      // where("userId", "==", currentUser.uid)
      const q = query(
        collection(db, "documents"),
        where("userId", "==", currentUser.uid),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const docs: UserDocumentRecord[] = [];

      querySnapshot.forEach((snap) => {
        const data = snap.data();
        docs.push({
          id: snap.id,
          userId: data.userId,
          fileName: data.fileName || "Untitled Document",
          fileType: data.fileType || "Commercial Contract",
          fileURL: data.fileURL || "",
          status: data.status || "ANALYZED",
          uploadedAt: data.uploadedAt || data.createdAt || new Date().toISOString(),
          analyzedAt: data.analyzedAt,
          summary: data.summary || "",
          documentText: data.documentText || "",
          analysis: data.analysis,
          comparisonResult: data.comparisonResult || null,
          attorneyBrief: data.attorneyBrief || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });

      // Sort client-side by uploadedAt/createdAt descending
      docs.sort((a, b) => {
        const timeA = new Date(a.uploadedAt || 0).getTime();
        const timeB = new Date(b.uploadedAt || 0).getTime();
        return timeB - timeA;
      });

      setUserDocuments(docs);
    } catch (err) {
      console.warn("Could not load user documents from Firestore:", err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [currentUser, isDemoUser]);

  useEffect(() => {
    fetchUserDocuments();
  }, [fetchUserDocuments]);

  // Save or update an analyzed document in the user's private collection
  const saveUserDocument = async (
    fileName: string,
    fileType: string,
    documentText: string,
    analysis?: AnalysisResult,
    comparisonResult?: ComparisonResult | null,
    attorneyBrief?: AttorneyBriefResult | null,
    existingDocId?: string
  ): Promise<UserDocumentRecord> => {
    if (!currentUser) {
      throw new Error("Must be logged in to save documents to cloud storage.");
    }

    const docId = existingDocId || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const summary = analysis?.summary || (documentText.slice(0, 200) + "...");

    const newRecord: UserDocumentRecord = {
      id: docId,
      userId: currentUser.uid,
      fileName: fileName.trim(),
      fileType: fileType.trim(),
      status: analysis ? "ANALYZED" : "UPLOADED",
      summary: summary.slice(0, 5000),
      documentText,
      analysis,
      comparisonResult,
      attorneyBrief,
      uploadedAt: new Date().toISOString(),
      analyzedAt: analysis ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
    };

    if (isDemoUser || currentUser.uid.startsWith("demo-")) {
      const updated = [newRecord, ...userDocuments.filter((d) => d.id !== docId)];
      setUserDocuments(updated);
      try {
        localStorage.setItem("legal_navigator_demo_docs", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save demo docs:", e);
      }
      return newRecord;
    }

    const docRef = doc(db, "documents", docId);
    const payload: any = {
      id: docId,
      userId: currentUser.uid,
      fileName: fileName.trim(),
      fileType: fileType.trim(),
      status: analysis ? "ANALYZED" : "UPLOADED",
      summary: summary.slice(0, 5000),
      documentText,
      uploadedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    if (analysis) {
      payload.analysis = analysis;
      payload.analyzedAt = new Date().toISOString();
    }
    if (comparisonResult !== undefined) {
      payload.comparisonResult = comparisonResult;
    }
    if (attorneyBrief !== undefined) {
      payload.attorneyBrief = attorneyBrief;
    }

    await setDoc(docRef, payload, { merge: true });

    setUserDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== docId);
      return [newRecord, ...filtered];
    });

    return newRecord;
  };

  // Delete a user document
  const deleteUserDocument = async (docId: string) => {
    if (!currentUser) return;

    if (isDemoUser || currentUser.uid.startsWith("demo-")) {
      const updated = userDocuments.filter((d) => d.id !== docId);
      setUserDocuments(updated);
      try {
        localStorage.setItem("legal_navigator_demo_docs", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not delete demo doc:", e);
      }
      return;
    }

    try {
      const docRef = doc(db, "documents", docId);
      await deleteDoc(docRef);
      setUserDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      console.error("Failed to delete document from Firestore:", err);
      throw err;
    }
  };


  // Find doc by id
  const getUserDocument = (docId: string): UserDocumentRecord | null => {
    return userDocuments.find((d) => d.id === docId) || null;
  };

  return (
    <UserDocumentsContext.Provider
      value={{
        userDocuments,
        isLoadingDocs,
        saveUserDocument,
        deleteUserDocument,
        getUserDocument,
        refreshUserDocuments: fetchUserDocuments,
      }}
    >
      {children}
    </UserDocumentsContext.Provider>
  );
};

export const useUserDocuments = () => {
  const context = useContext(UserDocumentsContext);
  if (!context) {
    throw new Error("useUserDocuments must be used within a UserDocumentsProvider");
  }
  return context;
};
