import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Scale,
  Sparkles,
  Printer,
  Copy,
  Check,
  Download,
  AlertCircle,
  FileCheck2,
  FolderArchive,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  FileDown,
} from "lucide-react";
import { AttorneyBriefResult } from "../types";

interface AttorneyPrepViewProps {
  documentTitle: string;
  documentText: string;
  documentType: string;
  brief: AttorneyBriefResult | null;
  onGenerateBrief: (userConcerns: string) => Promise<void>;
  isGenerating: boolean;
  onOpenExportModal?: () => void;
}

export const AttorneyPrepView: React.FC<AttorneyPrepViewProps> = ({
  documentTitle,
  documentText,
  documentType,
  brief,
  onGenerateBrief,
  isGenerating,
  onOpenExportModal,
}) => {
  const [userConcerns, setUserConcerns] = useState(
    "Clarify liability limits, avoid unfair termination penalties, and protect my personal rights/property."
  );
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    onGenerateBrief(userConcerns);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAll = () => {
    if (!brief) return;
    const textToCopy = `ATTORNEY CONSULTATION DOSSIER
Document Subject: ${documentTitle}
Prepared via Legal Document Navigator (Client Intake Pack)

EXECUTIVE BRIEF:
${brief.executiveBrief}

CLIENT OBJECTIVE:
${brief.clientObjective}

KEY ISSUES IDENTIFIED:
${brief.keyIssuesIdentified
  .map(
    (issue, i) =>
      `${i + 1}. [${issue.priority} PRIORITY] ${issue.issue}\n   Clause: ${issue.clauseReference}\n   Exposure: ${issue.potentialExposure}`
  )
  .join("\n\n")}

PRIORITIZED ATTORNEY QUESTIONS & RATIONALE:
${brief.prioritizedAttorneyQuestions
  .map(
    (q, i) =>
      `Q${i + 1}: ${q.question}\n   Strategic Reason: ${q.strategicReason}\n   Desired Outcome: ${q.desiredOutcome}`
  )
  .join("\n\n")}

RECOMMENDED REDLINES / COUNTER-PROPOSALS:
${brief.recommendedRedlinesOrCounterproposals
  .map(
    (r, i) =>
      `Revision ${i + 1} (${r.section}):\n   Current Problematic Term: "${r.currentProblematicTerm}"\n   Proposed Redline: "${r.proposedRevision}"`
  )
  .join("\n\n")}

DOCUMENTS TO BRING:
${brief.documentsToBringToMeeting.map((d) => `- ${d}`).join("\n")}
`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Goal Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 space-y-4 no-print border border-slate-200/80 dark:border-slate-800 shadow-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Attorney Consultation Dossier Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structure intake, targeted questions, and redlines to save costly billable lawyer hours
              </p>
            </div>
          </div>

          {brief && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-copy-dossier"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 glass-subtle hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Full Dossier
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-print-dossier"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 glass-subtle hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Browser Print / Native Print Dialog"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Browser Print
              </button>

              <button
                type="button"
                id="btn-export-brief-pdf"
                onClick={onOpenExportModal || handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="Export formatted analysis and attorney brief to print-ready PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                Export Print-Ready PDF
              </button>
            </div>
          )}
        </div>

        {/* User Objective Prompt */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            What are your specific concerns or goals regarding this agreement?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={userConcerns}
              onChange={(e) => setUserConcerns(e.target.value)}
              placeholder="e.g. Can I terminate early without paying full year? Is the non-compete enforceable?"
              className="flex-1 text-xs px-3.5 py-2.5 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              id="btn-generate-attorney-brief"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Formulating Dossier...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {brief ? "Re-generate Dossier" : "Generate Attorney Dossier"}
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Tip: Clarifying your desired outcome (e.g. signing safely, negotiating a specific clause, or exiting an agreement) produces more targeted attorney questions.
          </p>
        </div>
      </motion.div>

      {isGenerating && (
        <div className="p-16 text-center glass-panel rounded-3xl no-print border border-slate-200/80 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold font-display text-slate-900 dark:text-white mb-1">
            Preparing Attorney Consultation Brief...
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Structuring the factual intake, formulating strategic questions, and compiling proposed redlines.
          </p>
        </div>
      )}

      {/* Generated Dossier Document */}
      {brief && !isGenerating && (
        <div className="space-y-6">
          {/* Print Header */}
          <div className="hidden print:block pb-4 border-b border-black mb-6">
            <h1 className="text-xl font-bold">CLIENT INTAKE &amp; ATTORNEY CONSULTATION BRIEF</h1>
            <p className="text-xs text-slate-600">
              Prepared for initial attorney consultation regarding: {documentTitle}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Generated via Legal Document Navigator AI. Informational briefing only; does not replace licensed legal counsel.
            </p>
          </div>

          {/* Section 1: Executive Brief & Client Objective */}
          <section className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Executive Intake Summary &amp; Client Objective
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Matter Context:
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-normal">{brief.executiveBrief}</p>
              </div>

              <div className="p-4 rounded-2xl glass-indigo border border-indigo-200 dark:border-indigo-800">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1">
                  Stated Client Objective:
                </span>
                <p className="text-indigo-950 dark:text-indigo-200 font-medium">{brief.clientObjective}</p>
              </div>
            </div>
          </section>

          {/* Section 2: Key High-Exposure Issues Identified */}
          <section className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Identified High-Exposure Clauses &amp; Legal Risks
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                {brief.keyIssuesIdentified.length} Priority Items
              </span>
            </div>

            <div className="space-y-3">
              {brief.keyIssuesIdentified.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl transition-all flex flex-col justify-between space-y-2 border ${
                    issue.priority === "HIGH"
                      ? "glass-rose border-rose-200 dark:border-rose-900"
                      : "glass-subtle border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {issue.issue}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        issue.priority === "HIGH"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {issue.priority} PRIORITY
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
                    Clause Reference: {issue.clauseReference}
                  </div>

                  <div className="text-xs text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Potential Exposure: </span>
                    {issue.potentialExposure}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Prioritized Attorney Questions */}
          <section className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Targeted Questions for Your Legal Professional
                </h3>
              </div>
              <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                Saves consultation billable time
              </span>
            </div>

            <div className="space-y-4">
              {brief.prioritizedAttorneyQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-subtle border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      "{q.question}"
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pl-8">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                        Strategic Reason:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {q.strategicReason}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl glass-emerald border border-emerald-300/80 dark:border-emerald-800/80">
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 block mb-0.5">
                        Targeted Outcome:
                      </span>
                      <span className="text-emerald-950 dark:text-emerald-200 leading-relaxed font-semibold">
                        {q.desiredOutcome}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Recommended Redlines */}
          <section className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Proposed Redline Revisions for Legal Review
              </h3>
            </div>

            <div className="space-y-3">
              {brief.recommendedRedlinesOrCounterproposals.map((redline, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-subtle space-y-2.5 text-xs border border-slate-200/60 dark:border-slate-800"
                >
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    {redline.section}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl glass-rose border border-rose-200 dark:border-rose-900">
                      <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">
                        Current Problematic Term:
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 italic">
                        "{redline.currentProblematicTerm}"
                      </span>
                    </div>

                    <div className="p-3 rounded-xl glass-emerald border border-emerald-200 dark:border-emerald-900">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                        Recommended Redline Revision:
                      </span>
                      <span className="text-emerald-950 dark:text-emerald-100 font-semibold">
                        "{redline.proposedRevision}"
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Documents Checklist */}
          <section className="glass-panel rounded-3xl p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800">
              <FolderArchive className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold font-display text-slate-900 dark:text-white">
                Document Checklist to Bring to Your Lawyer Consultation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
              {brief.documentsToBringToMeeting.map((docItem, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl glass-subtle flex items-start gap-2 hover:bg-white dark:hover:bg-slate-800 transition-all font-medium border border-slate-200/60 dark:border-slate-800"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{docItem}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
