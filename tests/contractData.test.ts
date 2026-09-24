import { describe, it, expect } from "vitest";
import { SAMPLE_DOCUMENTS } from "../src/data/sampleDocuments";

describe("Problem Statement Alignment & Legal Document Corpus", () => {
  it("includes essential consumer and business document archetypes", () => {
    expect(SAMPLE_DOCUMENTS.length).toBeGreaterThanOrEqual(4);

    const categories = SAMPLE_DOCUMENTS.map((d) => d.category.toLowerCase());
    expect(categories.some((c) => c.includes("lease"))).toBe(true);
    expect(categories.some((c) => c.includes("employment"))).toBe(true);
    expect(categories.some((c) => c.includes("saas") || c.includes("service"))).toBe(true);
  });

  it("each sample document has robust legal provisions and suggested questions", () => {
    SAMPLE_DOCUMENTS.forEach((doc) => {
      expect(doc.id).toBeDefined();
      expect(doc.title.length).toBeGreaterThan(5);
      expect(doc.fullText.length).toBeGreaterThan(200);
      expect(doc.suggestedQuestions.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("ensures sample documents contain high-impact provisions to analyze", () => {
    const combinedText = SAMPLE_DOCUMENTS.map((d) => d.fullText).join(" ");
    expect(combinedText).toMatch(/termination|indemnif|liability|confidentiality|governing law/i);
  });
});
