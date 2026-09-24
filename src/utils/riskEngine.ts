import { AnalysisResult, ChecklistItem, RiskFactorItem } from "../types";

export interface RiskColorInfo {
  badge: string;
  bar: string;
  label: string;
  text: string;
  bgSubtle: string;
  borderSubtle: string;
}

/**
 * Returns accessible styling and semantic label based on numeric risk score (0-100)
 */
export function getRiskColorInfo(score: number): RiskColorInfo {
  if (score >= 70) {
    return {
      badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      bar: "from-rose-500 via-rose-600 to-red-600",
      label: "HIGH / CRITICAL RISK",
      text: "text-rose-600 dark:text-rose-400",
      bgSubtle: "bg-rose-50 dark:bg-rose-950/40",
      borderSubtle: "border-rose-200 dark:border-rose-800",
    };
  }
  if (score >= 40) {
    return {
      badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      bar: "from-amber-400 via-amber-500 to-orange-500",
      label: "MODERATE RISK",
      text: "text-amber-600 dark:text-amber-400",
      bgSubtle: "bg-amber-50 dark:bg-amber-950/40",
      borderSubtle: "border-amber-200 dark:border-amber-800",
    };
  }
  return {
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    bar: "from-emerald-400 via-emerald-500 to-teal-600",
    label: "LOW / BALANCED RISK",
    text: "text-emerald-600 dark:text-emerald-400",
    bgSubtle: "bg-emerald-50 dark:bg-emerald-950/40",
    borderSubtle: "border-emerald-200 dark:border-emerald-800",
  };
}

/**
 * Classifies numeric score into standard legal risk tier
 */
export function classifyRiskLevel(score: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (score < 0) return "LOW";
  if (score <= 35) return "LOW";
  if (score <= 65) return "MODERATE";
  if (score <= 84) return "HIGH";
  return "CRITICAL";
}

/**
 * Dynamically derive explainable risk factor weights based on the actual document analysis
 */
export function deriveDynamicRiskFactors(analysis: AnalysisResult | null): RiskFactorItem[] {
  if (!analysis) return [];

  // 1. If analysis provided explicit document-specific riskFactors, use them
  if (analysis.riskFactors && analysis.riskFactors.length > 0) {
    return analysis.riskFactors;
  }

  // 2. Derive dynamically from hidden traps of this document
  if (analysis.hiddenTrapsOrGotchas && analysis.hiddenTrapsOrGotchas.length > 0) {
    return analysis.hiddenTrapsOrGotchas.slice(0, 5).map((trap) => {
      const pointValues = [
        Math.max(14, Math.round((analysis.riskScore || 60) * 0.32)),
        Math.max(12, Math.round((analysis.riskScore || 60) * 0.26)),
        Math.max(10, Math.round((analysis.riskScore || 60) * 0.2)),
        Math.max(8, Math.round((analysis.riskScore || 60) * 0.14)),
        Math.max(6, Math.round((analysis.riskScore || 60) * 0.08)),
      ];
      const severityMap: Record<number, "CRITICAL" | "HIGH" | "MODERATE"> = {
        0: "CRITICAL",
        1: "HIGH",
        2: "HIGH",
        3: "MODERATE",
        4: "MODERATE",
      };
      const idx = analysis.hiddenTrapsOrGotchas.indexOf(trap);
      return {
        name: trap.title,
        points: `+${pointValues[idx % pointValues.length]}`,
        severity: severityMap[idx] || "MODERATE",
        rationale: trap.description.slice(0, 100) + (trap.description.length > 100 ? "..." : ""),
      };
    });
  }

  // 3. Derive dynamically from key clauses flagged as CRITICAL or CAUTION
  if (analysis.keyClauses && analysis.keyClauses.length > 0) {
    const hazardous = analysis.keyClauses.filter(
      (c) => c.riskLevel === "CRITICAL" || c.riskLevel === "CAUTION"
    );
    if (hazardous.length > 0) {
      return hazardous.slice(0, 4).map((c) => ({
        name: c.clauseTitle,
        points: c.riskLevel === "CRITICAL" ? "+24" : "+14",
        severity: c.riskLevel === "CRITICAL" ? "CRITICAL" : "MODERATE",
        rationale: c.whyItMatters.slice(0, 90) + (c.whyItMatters.length > 90 ? "..." : ""),
      }));
    }
  }

  // Fallback default balanced baseline
  return [
    {
      name: "Standard Commercial Terms",
      points: "+12",
      severity: "LOW",
      rationale: "Contract reflects customary bilateral provisions.",
    },
    {
      name: "Notice & Cure Period Requirement",
      points: "+10",
      severity: "MODERATE",
      rationale: "Formal notification periods required for termination.",
    },
  ];
}

/**
 * Calculates checklist completion metrics
 */
export function calculateChecklistProgress(checklist: ChecklistItem[]) {
  const total = checklist.length;
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0, criticalPending: 0 };
  }

  const completed = checklist.filter((item) => item.completed).length;
  const criticalPending = checklist.filter(
    (item) => !item.completed && item.importance === "CRITICAL"
  ).length;

  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
    criticalPending,
  };
}

/**
 * Calculates estimated readability reduction gain
 */
export function calculateReadabilityGain(original: string, simplified: string): number {
  const parseGrade = (val: string): number => {
    const matched = val.match(/\d+(\.\d+)?/);
    if (matched) return parseFloat(matched[0]);
    if (/college|postgraduate|doctorate|professional/i.test(val)) return 16;
    if (/high/i.test(val)) return 11;
    if (/middle|elementary/i.test(val)) return 7;
    return 14;
  };

  const origGrade = parseGrade(original);
  const simpGrade = parseGrade(simplified);
  if (origGrade <= 0) return 40;
  const reduction = ((origGrade - simpGrade) / origGrade) * 100;
  return Math.max(10, Math.min(85, Math.round(reduction)));
}

/**
 * Sanitizes input string to prevent script injection and normalize whitespace
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
