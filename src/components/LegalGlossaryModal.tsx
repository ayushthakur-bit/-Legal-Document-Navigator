import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Search, BookOpen } from "lucide-react";
import { GlossaryItem } from "../types";

interface LegalGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTerms: GlossaryItem[];
}

const COMMON_LEGAL_TERMS: GlossaryItem[] = [
  {
    term: "Indemnification",
    plainDefinition:
      "A contractual promise where one party agrees to pay for the other party's legal expenses, damages, or lawsuits if a problem arises.",
    exampleContext: "Defend and hold harmless against third-party claims.",
  },
  {
    term: "Force Majeure",
    plainDefinition:
      "A clause that frees both parties from liability or obligation when an extraordinary event or circumstance beyond their control occurs (e.g., war, strike, riot, or 'Act of God').",
    exampleContext: "Neither party shall be liable for delays resulting from events beyond reasonable control.",
  },
  {
    term: "Liquidated Damages",
    plainDefinition:
      "A pre-determined, agreed-upon amount of money that must be paid if one party breaks a specific rule, rather than calculating actual losses in court.",
    exampleContext: "Early lease cancellation forfeits deposit as liquidated damages.",
  },
  {
    term: "Severability",
    plainDefinition:
      "A standard clause ensuring that if a court rules that one part of the contract is invalid or illegal, the remainder of the contract still stays in full effect.",
    exampleContext: "If any provision is found invalid, remaining provisions remain enforceable.",
  },
  {
    term: "Joint and Several Liability",
    plainDefinition:
      "When multiple people sign an agreement (like roommates on a lease), each person can be held responsible for the entire amount owed, not just their fractional share.",
    exampleContext: "Tenants are jointly and severally liable for all rent.",
  },
  {
    term: "At-Will Employment",
    plainDefinition:
      "An employment relationship where either the employer or employee can end the job at any time, for any reason (or no reason), without advance notice, as long as it isn't discriminatory or illegal.",
    exampleContext: "Employment may be terminated by either party at any time.",
  },
  {
    term: "Injunctive Relief",
    plainDefinition:
      "A court order requiring someone to immediately stop doing a specific action (such as leaking confidential trade secrets), rather than just paying money damages later.",
    exampleContext: "The company may seek an immediate restraining order or injunction.",
  },
  {
    term: "Right of Cure",
    plainDefinition:
      "A grace period giving a party notice of an alleged problem and a set number of days (usually 10-30 days) to fix it before they are considered in legal default.",
    exampleContext: "Written notice with 15 days right to cure prior to termination.",
  },
];

export const LegalGlossaryModal: React.FC<LegalGlossaryModalProps> = ({
  isOpen,
  onClose,
  documentTerms,
}) => {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  // Merge document specific terms with common terms (deduplicating by term)
  const combinedTermsMap = new Map<string, GlossaryItem>();
  documentTerms.forEach((t) => combinedTermsMap.set(t.term.toLowerCase(), t));
  COMMON_LEGAL_TERMS.forEach((t) => {
    if (!combinedTermsMap.has(t.term.toLowerCase())) {
      combinedTermsMap.set(t.term.toLowerCase(), t);
    }
  });

  const allTerms = Array.from(combinedTermsMap.values());

  const filteredTerms = allTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.plainDefinition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      id="modal-legal-glossary"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel-elevated rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-4 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                Plain-English Legal Glossary
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Translating legal terms and standard boilerplate into everyday language
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search legal terms (e.g. Indemnification, Force Majeure, Severability)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-3 py-2.5 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Term List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 no-scrollbar">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No legal terms found matching "{search}".
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.term}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                    Plain Meaning
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {item.plainDefinition}
                </p>
                {item.exampleContext && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <strong className="not-italic text-slate-900 dark:text-slate-200 font-bold">Contract Context: </strong>
                    "{item.exampleContext}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Close Glossary
          </button>
        </div>
      </motion.div>
    </div>
  );
};
