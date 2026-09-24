import { IndexedDocumentPage, IndexedDocumentSection, GroundedEvidence } from "../types";

/**
 * Validates file upload type and size (Security & Integrity)
 */
export function validateLegalDocumentFile(file: { name: string; size: number }): {
  valid: boolean;
  error?: string;
} {
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".rtf"];

  if (!file || !file.name) {
    return { valid: false, error: "No file selected. Please select a legal document." };
  }

  const nameLower = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: `Unsupported file format. Please upload a PDF, DOCX, TXT, RTF, or MD file.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 10 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Detects adversarial prompt injection attempts embedded in legal documents or user questions (Security Defense)
 */
export function detectPromptInjection(query: string): {
  isMalicious: boolean;
  sanitized: string;
  reason?: string;
} {
  if (!query || typeof query !== "string") {
    return { isMalicious: false, sanitized: "" };
  }

  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
    /reveal\s+(the\s+)?(system\s+prompt|initial\s+prompt|developer\s+mode)/i,
    /disregard\s+(all\s+)?(rules|guidelines|context)/i,
    /system\s+instruction/i,
    /you\s+are\s+now\s+(in\s+)?(dan|unfiltered|jailbreak)\s+mode/i,
    /bypass\s+all\s+(filters|safeguards)/i,
    /print\s+your\s+instructions/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(query)) {
      return {
        isMalicious: true,
        sanitized: query.replace(/[<>]/g, "").trim(),
        reason: "Security Guard: Adversarial instruction detected and neutralized.",
      };
    }
  }

  return {
    isMalicious: false,
    sanitized: query.replace(/[<>]/g, "").trim(),
  };
}

/**
 * Segments raw contract/document text into structured, indexed pages and sections
 */
export function indexDocument(fullText: string): {
  pages: IndexedDocumentPage[];
  sections: IndexedDocumentSection[];
  totalWordCount: number;
} {
  if (!fullText || !fullText.trim()) {
    return { pages: [], sections: [], totalWordCount: 0 };
  }

  const cleanText = fullText.replace(/\r\n/g, "\n");
  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWordCount = words.length;

  // 1. Segment into simulated document pages (~350 words per page or by explicit page breaks)
  const explicitPageBreaks = cleanText.split(/\n(?:\f|--- PAGE \d+ ---|=== PAGE \d+ ===)\n/i);
  let pages: IndexedDocumentPage[] = [];

  if (explicitPageBreaks.length > 1) {
    pages = explicitPageBreaks.map((pageContent, idx) => ({
      pageNumber: idx + 1,
      text: pageContent.trim(),
      wordCount: pageContent.split(/\s+/).filter(Boolean).length,
    }));
  } else {
    // Break by word count (~320-380 words per page)
    const WORDS_PER_PAGE = 350;
    const totalPages = Math.max(1, Math.ceil(totalWordCount / WORDS_PER_PAGE));
    for (let p = 0; p < totalPages; p++) {
      const start = p * WORDS_PER_PAGE;
      const end = Math.min((p + 1) * WORDS_PER_PAGE, totalWordCount);
      const pageSlice = words.slice(start, end).join(" ");
      pages.push({
        pageNumber: p + 1,
        text: pageSlice,
        wordCount: end - start,
      });
    }
  }

  // 2. Identify structured contract sections
  // Regex to match legal section headers (e.g. "1. PREMISES", "SECTION 4. RENEWAL", "ARTICLE V - INDEMNITY", "8. GOVERNING LAW")
  const lines = cleanText.split("\n");
  const sectionHeaderRegex = /^(?:(?:SECTION|ARTICLE|CLAUSE)\s+([0-9A-Z\.]+)|([0-9]{1,2}\.))\s*[-–—:]?\s*(.+)$/i;

  const rawSections: { number: string; title: string; lineIndex: number }[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 90) {
      const match = trimmed.match(sectionHeaderRegex);
      if (match) {
        const secNum = (match[1] || match[2] || "").trim();
        const secTitle = (match[3] || trimmed).trim();
        rawSections.push({
          number: secNum.endsWith(".") ? secNum : `${secNum}.`,
          title: secTitle,
          lineIndex: index,
        });
      }
    }
  });

  const sections: IndexedDocumentSection[] = [];

  if (rawSections.length > 0) {
    rawSections.forEach((sec, idx) => {
      const nextSec = rawSections[idx + 1];
      const startLine = sec.lineIndex;
      const endLine = nextSec ? nextSec.lineIndex : lines.length;
      const content = lines.slice(startLine, endLine).join("\n").trim();

      // Determine page number based on word offset
      const wordsBefore = lines
        .slice(0, startLine)
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      const pageNumber = Math.max(1, Math.floor(wordsBefore / 350) + 1);

      sections.push({
        id: `sec-${idx + 1}`,
        sectionNumber: sec.number || `§${idx + 1}`,
        title: sec.title.replace(/^[0-9\.\-\s]+/, "").trim() || `Section ${idx + 1}`,
        pageNumber,
        content,
        previewSnippet: content.slice(0, 180).replace(/\n/g, " ") + (content.length > 180 ? "..." : ""),
      });
    });
  } else {
    // Fallback: Partition paragraphs into sections
    const paragraphs = cleanText.split(/\n\s*\n/).filter((p) => p.trim().length > 20);
    paragraphs.forEach((para, idx) => {
      const firstLine = para.trim().split("\n")[0].slice(0, 45);
      const pageNumber = Math.max(1, Math.floor((idx * 60) / 350) + 1);
      sections.push({
        id: `sec-${idx + 1}`,
        sectionNumber: `§${idx + 1}`,
        title: firstLine || `Clause ${idx + 1}`,
        pageNumber,
        content: para.trim(),
        previewSnippet: para.trim().slice(0, 180) + "...",
      });
    });
  }

  return { pages, sections, totalWordCount };
}

/**
 * Smart Chunk Retrieval (Efficiency): Finds top relevant sections for a query without sending entire document
 */
export function findRelevantSections(
  sections: IndexedDocumentSection[],
  query: string,
  maxResults = 3
): IndexedDocumentSection[] {
  if (!sections || sections.length === 0 || !query) {
    return sections ? sections.slice(0, maxResults) : [];
  }

  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["what", "when", "where", "which", "does", "have", "this", "that", "with", "from"].includes(w));

  // Domain synonym expansions for legal topics
  const synonyms: Record<string, string[]> = {
    terminate: ["termination", "cancel", "cancellation", "vacate", "expire", "end", "notice"],
    cancel: ["terminate", "termination", "cancellation", "vacate", "void"],
    pay: ["payment", "rent", "fee", "late", "cost", "charge", "balance", "deposit"],
    money: ["rent", "payment", "amount", "deposit", "fee", "penalty"],
    damage: ["damages", "liquidated", "indemnif", "liability", "harm", "loss", "casualty"],
    enter: ["entry", "inspect", "inspection", "access", "landlord"],
    renew: ["renewal", "extension", "automatic", "notice", "term"],
    compete: ["non-compete", "solicit", "solicitation", "restrict", "covenant"],
    secret: ["confidential", "proprietary", "disclosure", "nda"],
    dispute: ["arbitration", "jurisdiction", "court", "jury", "governing law", "attorney"],
  };

  const expandedTerms = new Set(queryTerms);
  queryTerms.forEach((term) => {
    Object.entries(synonyms).forEach(([key, synList]) => {
      if (term.includes(key) || synList.includes(term)) {
        synList.forEach((s) => expandedTerms.add(s));
        expandedTerms.add(key);
      }
    });
  });

  const scoredSections = sections.map((sec) => {
    let score = 0;
    const titleLower = sec.title.toLowerCase();
    const contentLower = sec.content.toLowerCase();

    expandedTerms.forEach((term) => {
      if (titleLower.includes(term)) {
        score += 8; // Heavy weight for section title match
      }
      const matches = (contentLower.match(new RegExp(`\\b${term}`, "gi")) || []).length;
      score += matches * 2;
    });

    return { sec, score };
  });

  scoredSections.sort((a, b) => b.score - a.score);

  // Return top scored sections (or fallback to first sections if zero match)
  const top = scoredSections.filter((s) => s.score > 0).map((s) => s.sec);
  if (top.length > 0) {
    return top.slice(0, maxResults);
  }

  return sections.slice(0, maxResults);
}

/**
 * Locate Evidence citation (Page & Section) for an answer quote
 */
export function locateEvidenceCitation(
  sections: IndexedDocumentSection[],
  quote: string
): GroundedEvidence {
  if (!sections || sections.length === 0) {
    return {
      source: "Document Reference",
      quote: quote || "Refer to document text",
    };
  }

  const cleanQuote = quote.toLowerCase().replace(/[^\w\s]/g, "").slice(0, 60);

  // Search through sections for direct match
  for (const sec of sections) {
    const cleanContent = sec.content.toLowerCase().replace(/[^\w\s]/g, "");
    if (cleanContent.includes(cleanQuote)) {
      return {
        clauseTitle: `${sec.title} (${sec.sectionNumber})`,
        source: `Page ${sec.pageNumber} • ${sec.sectionNumber} ${sec.title}`,
        quote: quote.trim(),
        sectionId: sec.id,
        pageNumber: sec.pageNumber,
      };
    }
  }

  // Fallback to section 1
  const first = sections[0];
  return {
    clauseTitle: `${first.title} (${first.sectionNumber})`,
    source: `Page ${first.pageNumber} • ${first.sectionNumber}`,
    quote: quote.trim(),
    sectionId: first.id,
    pageNumber: first.pageNumber,
  };
}
