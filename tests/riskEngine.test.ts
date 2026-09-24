import { describe, it, expect } from "vitest";
import {
  getRiskColorInfo,
  classifyRiskLevel,
  deriveDynamicRiskFactors,
  calculateChecklistProgress,
  calculateReadabilityGain,
  sanitizeText,
} from "../src/utils/riskEngine";
import { AnalysisResult, ChecklistItem } from "../src/types";

describe("Legal Risk Engine & Calibration", () => {
  describe("getRiskColorInfo()", () => {
    it("returns high/critical styling for risk scores >= 70", () => {
      const result = getRiskColorInfo(75);
      expect(result.label).toBe("HIGH / CRITICAL RISK");
      expect(result.badge).toContain("rose");
      expect(result.bar).toContain("rose");
    });

    it("returns moderate styling for risk scores between 40 and 69", () => {
      const result = getRiskColorInfo(55);
      expect(result.label).toBe("MODERATE RISK");
      expect(result.badge).toContain("amber");
      expect(result.bar).toContain("amber");
    });

    it("returns low/balanced styling for risk scores < 40", () => {
      const result = getRiskColorInfo(25);
      expect(result.label).toBe("LOW / BALANCED RISK");
      expect(result.badge).toContain("emerald");
      expect(result.bar).toContain("emerald");
    });
  });

  describe("classifyRiskLevel()", () => {
    it("accurately classifies edge boundaries", () => {
      expect(classifyRiskLevel(0)).toBe("LOW");
      expect(classifyRiskLevel(35)).toBe("LOW");
      expect(classifyRiskLevel(36)).toBe("MODERATE");
      expect(classifyRiskLevel(65)).toBe("MODERATE");
      expect(classifyRiskLevel(66)).toBe("HIGH");
      expect(classifyRiskLevel(84)).toBe("HIGH");
      expect(classifyRiskLevel(85)).toBe("CRITICAL");
      expect(classifyRiskLevel(100)).toBe("CRITICAL");
    });
  });

  describe("deriveDynamicRiskFactors()", () => {
    it("returns empty array if analysis is null", () => {
      expect(deriveDynamicRiskFactors(null)).toEqual([]);
    });

    it("prioritizes explicit risk factors if provided by backend analysis", () => {
      const mockAnalysis: Partial<AnalysisResult> = {
        riskScore: 78,
        riskFactors: [
          { name: "Unilateral Fee Shifting", points: "+22", severity: "CRITICAL", rationale: "Loser pays winner fees" },
          { name: "Automatic 12-Month Renewal", points: "+18", severity: "HIGH", rationale: "90-day certified mail trap" },
        ],
      };

      const factors = deriveDynamicRiskFactors(mockAnalysis as AnalysisResult);
      expect(factors).toHaveLength(2);
      expect(factors[0].name).toBe("Unilateral Fee Shifting");
      expect(factors[0].points).toBe("+22");
    });

    it("derives dynamic risk factors from hidden traps when explicit factors are missing", () => {
      const mockAnalysis: Partial<AnalysisResult> = {
        riskScore: 80,
        hiddenTrapsOrGotchas: [
          { title: "Indemnity Shifting", description: "Tenant indemnifies landlord against landlord's own negligence", mitigationOrQuestion: "Negotiate mutual gross negligence carveout" },
          { title: "Liquidated Damages Penalty", description: "Entire remaining contract term accelerated on day 1 of default", mitigationOrQuestion: "Cap at 60 days rent" },
        ],
      };

      const factors = deriveDynamicRiskFactors(mockAnalysis as AnalysisResult);
      expect(factors).toHaveLength(2);
      expect(factors[0].name).toBe("Indemnity Shifting");
      expect(factors[0].severity).toBe("CRITICAL");
      expect(factors[0].points).toMatch(/^\+\d+$/);
    });

    it("falls back to key clauses if no traps exist", () => {
      const mockAnalysis: Partial<AnalysisResult> = {
        riskScore: 65,
        keyClauses: [
          { clauseTitle: "Non-Compete Radius", originalSnippet: "200 miles for 36 months", plainEnglish: "Restricts working anywhere nearby", riskLevel: "CRITICAL", whyItMatters: "May prevent employment", category: "Restrictive Covenants" },
        ],
      };

      const factors = deriveDynamicRiskFactors(mockAnalysis as AnalysisResult);
      expect(factors).toHaveLength(1);
      expect(factors[0].name).toBe("Non-Compete Radius");
      expect(factors[0].points).toBe("+24");
    });
  });

  describe("calculateChecklistProgress()", () => {
    it("handles empty checklist correctly", () => {
      expect(calculateChecklistProgress([])).toEqual({
        total: 0,
        completed: 0,
        percentage: 0,
        criticalPending: 0,
      });
    });

    it("calculates percentage and tracks critical pending items", () => {
      const checklist: ChecklistItem[] = [
        { id: "1", item: "Review insurance limits", importance: "CRITICAL", category: "Risk", completed: false },
        { id: "2", item: "Check termination notice period", importance: "CRITICAL", category: "Terms", completed: true },
        { id: "3", item: "Confirm payment schedule", importance: "RECOMMENDED", category: "Financial", completed: true },
        { id: "4", item: "Save draft copy locally", importance: "OPTIONAL", category: "Admin", completed: false },
      ];

      const progress = calculateChecklistProgress(checklist);
      expect(progress.total).toBe(4);
      expect(progress.completed).toBe(2);
      expect(progress.percentage).toBe(50);
      expect(progress.criticalPending).toBe(1); // item 1 is incomplete CRITICAL
    });
  });

  describe("calculateReadabilityGain()", () => {
    it("calculates positive comprehension gain when legalese is simplified", () => {
      const gain = calculateReadabilityGain("Grade 16 (Postgraduate)", "Grade 8 (Middle School)");
      expect(gain).toBeGreaterThanOrEqual(40);
      expect(gain).toBeLessThanOrEqual(85);
    });
  });

  describe("sanitizeText()", () => {
    it("removes dangerous angle brackets and trims excessive whitespace", () => {
      const dirty = "   <script>alert('xss')</script>  Commercial   Lease  Agreement   ";
      const clean = sanitizeText(dirty);
      expect(clean).toBe("scriptalert('xss')/script Commercial Lease Agreement");
    });
  });
});
