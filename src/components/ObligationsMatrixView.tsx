import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ListOrdered,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter,
  UserCheck,
  Building,
} from "lucide-react";
import { ObligationItem, KeyDateDeadline } from "../types";

interface ObligationsMatrixViewProps {
  obligations: ObligationItem[];
  keyDates: KeyDateDeadline[];
  parties: string[];
}

export const ObligationsMatrixView: React.FC<ObligationsMatrixViewProps> = ({
  obligations,
  keyDates,
  parties,
}) => {
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<string>("ALL");

  const uniqueParties = Array.from(
    new Set(obligations.map((o) => o.party).filter(Boolean))
  );

  const filteredObligations = obligations.filter((o) => {
    if (selectedPartyFilter === "ALL") return true;
    return o.party.toLowerCase().includes(selectedPartyFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Overview & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 border border-slate-200/80 dark:border-slate-800"
      >
        <div>
          <h2 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-500" />
            Obligations &amp; Rights Matrix
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explicit duties, covenants, deadlines, and breach consequences by party
          </p>
        </div>

        {/* Party Filter Pills */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Filter by Party:</span>
          <button
            onClick={() => setSelectedPartyFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              selectedPartyFilter === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "glass-subtle text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            All Parties ({obligations.length})
          </button>
          {uniqueParties.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPartyFilter(p)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer truncate max-w-[160px] ${
                selectedPartyFilter === p
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "glass-subtle text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Critical Obligations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredObligations.map((item, idx) => {
          const isUserParty =
            item.party.toLowerCase().includes("tenant") ||
            item.party.toLowerCase().includes("employee") ||
            item.party.toLowerCase().includes("contractor") ||
            item.party.toLowerCase().includes("client") ||
            item.party.toLowerCase().includes("second");

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`p-5 rounded-3xl transition-all flex flex-col justify-between space-y-4 border ${
                item.isCrucial
                  ? "glass-rose border-rose-200 dark:border-rose-900 shadow-sm"
                  : "glass-panel border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                      isUserParty
                        ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                        : "glass-subtle text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
                    }`}
                  >
                    {isUserParty ? (
                      <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Building className="w-3 h-3 text-slate-500" />
                    )}
                    {item.party}
                  </span>

                  {item.isCrucial && (
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-200 dark:border-rose-900">
                      <AlertCircle className="w-3 h-3" />
                      CRITICAL COVENANT
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {item.obligation}
                </h3>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400">Deadline or Trigger: </span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{item.deadlineOrTrigger}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400">Consequence of Breach: </span>
                    <span className="text-rose-700 dark:text-rose-400 font-semibold">{item.consequenceOfBreach}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Critical Dates & Deadlines Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 space-y-4 border border-slate-200/80 dark:border-slate-800"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Notice Periods &amp; Critical Timeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key milestones where omission could trigger automatic renewal or forfeiture
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {keyDates.length} Scheduled Triggers
          </span>
        </div>

        <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900 ml-4 pl-6 space-y-5 my-2">
          {keyDates.map((date, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-xs" />
              <div className="p-4 rounded-2xl glass-subtle hover:bg-white dark:hover:bg-slate-800/80 transition-all border border-slate-200/60 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {date.event}
                  </span>
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                    {date.timeframe}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  <strong className="text-slate-900 dark:text-slate-100">Action Required: </strong>
                  {date.actionRequired}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
