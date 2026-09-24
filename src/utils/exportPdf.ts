import { jsPDF } from "jspdf";
import { AnalysisResult, AttorneyBriefResult, SampleDocument } from "../types";

export interface ExportPdfOptions {
  includeAnalysis?: boolean;
  includeAttorneyBrief?: boolean;
  includeObligations?: boolean;
  includeTraps?: boolean;
}

/**
 * Generates and downloads a clean, multi-page, print-ready PDF document
 * containing the current legal analysis and attorney consultation brief.
 */
export function exportAnalysisAndBriefPdf(
  document: SampleDocument,
  analysis: AnalysisResult | null,
  attorneyBrief: AttorneyBriefResult | null,
  options: ExportPdfOptions = {}
): boolean {
  try {
    const {
      includeAnalysis = true,
      includeAttorneyBrief = true,
      includeObligations = true,
      includeTraps = true,
    } = options;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Helper: Page management
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 20) {
        doc.addPage();
        y = margin + 10;
        return true;
      }
      return false;
    };

    // Helper: Draw Section Header
    const drawSectionHeader = (title: string, subtitle?: string) => {
      checkPageBreak(22);
      y += 4;
      doc.setFillColor(241, 245, 249); // slate-100
      doc.roundedRect(margin, y, contentWidth, 9, 2, 2, "F");
      
      doc.setFillColor(79, 70, 229); // indigo-600
      doc.rect(margin, y, 2.5, 9, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(title.toUpperCase(), margin + 5, y + 6.2);
      y += 13;

      if (subtitle) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const subLines = doc.splitTextToSize(subtitle, contentWidth);
        doc.text(subLines, margin, y);
        y += subLines.length * 4.2 + 3;
      }
    };

    // ================= PAGE 1: TITLE BANNER =================
    // Top Brand Bar
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y, contentWidth, 22, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("LEGAL DOCUMENT NAVIGATOR", margin + 6, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(199, 210, 254); // indigo-200
    doc.text("Comprehensive Analysis & Attorney Consultation Dossier", margin + 6, y + 16);

    // Date in header
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    const dateStr = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    doc.text(`Generated: ${dateStr}`, pageWidth - margin - 6, y + 12, { align: "right" });

    y += 26;

    // Document Metadata Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(document.title, contentWidth - 45);
    doc.text(titleLines[0] || document.title, margin + 5, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Category: ${document.category || "General Contract"}  |  Tag: ${document.tag || "Legal Document"}`, margin + 5, y + 13);
    doc.text("Confidential Client Intake & Counsel Prep Report", margin + 5, y + 18);

    // Risk badge on right
    if (analysis) {
      const riskScore = analysis.riskScore ?? 0;
      const isHigh = riskScore >= 65;
      const isMod = riskScore >= 35 && riskScore < 65;

      if (isHigh) {
        doc.setFillColor(254, 226, 226); // red-100
        doc.setDrawColor(239, 68, 68);
        doc.setTextColor(185, 28, 28);
      } else if (isMod) {
        doc.setFillColor(254, 243, 199); // amber-100
        doc.setDrawColor(245, 158, 11);
        doc.setTextColor(180, 83, 9);
      } else {
        doc.setFillColor(209, 250, 229); // emerald-100
        doc.setDrawColor(16, 185, 129);
        doc.setTextColor(4, 120, 87);
      }

      doc.roundedRect(pageWidth - margin - 35, y + 4, 30, 14, 2, 2, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${riskScore}% RISK`, pageWidth - margin - 20, y + 10.5, { align: "center" });
      doc.setFontSize(7);
      doc.text(analysis.overallRiskRating || "ASSESSED", pageWidth - margin - 20, y + 15, { align: "center" });
    }

    y += 28;

    // ================= SECTION 1: ANALYSIS EXECUTIVE SUMMARY =================
    if (includeAnalysis && analysis) {
      drawSectionHeader(
        "1. Document Intelligence & Plain-English Overview",
        `Reading Complexity: Original ${analysis.readingGradeLevel || "Grade 14+"} -> Simplified ${analysis.simplifiedGradeLevel || "Grade 8-9"}`
      );

      // Summary text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const summaryLines = doc.splitTextToSize(analysis.summary || "No summary provided.", contentWidth);
      checkPageBreak(summaryLines.length * 4.5 + 4);
      doc.text(summaryLines, margin, y);
      y += summaryLines.length * 4.5 + 4;

      // Risk Summary Box
      if (analysis.riskSummary) {
        checkPageBreak(20);
        doc.setFillColor(255, 247, 237); // orange-50
        doc.setDrawColor(253, 186, 116); // orange-300
        const riskLines = doc.splitTextToSize(`Key Risk Assessment: ${analysis.riskSummary}`, contentWidth - 8);
        const boxH = Math.max(14, riskLines.length * 4.2 + 6);
        doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(154, 52, 18); // orange-800
        doc.text(riskLines, margin + 4, y + 5);
        y += boxH + 4;
      }

      // Key Parties
      if (analysis.keyParties && analysis.keyParties.length > 0) {
        checkPageBreak(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text("Identified Parties:", margin, y);
        y += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const partiesText = analysis.keyParties.join("  |  ");
        const partyLines = doc.splitTextToSize(partiesText, contentWidth);
        doc.text(partyLines, margin, y);
        y += partyLines.length * 4.2 + 4;
      }
    }

    // ================= SECTION 2: OBLIGATIONS & DEADLINES =================
    if (includeObligations && analysis && analysis.obligations && analysis.obligations.length > 0) {
      drawSectionHeader("2. Critical Obligations & Compliance Matrix", "Key duties categorized by responsible party and timeframe.");

      analysis.obligations.slice(0, 8).forEach((ob, idx) => {
        checkPageBreak(16);
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, contentWidth, 14, "FD");

        // Status indicator
        const isUrgent = !!ob.isCrucial;
        doc.setFillColor(isUrgent ? 239 : 79, isUrgent ? 68 : 70, isUrgent ? 68 : 229);
        doc.rect(margin, y, 1.5, 14, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${idx + 1}. [${ob.party || "Party"}] ${ob.deadlineOrTrigger ? `(${ob.deadlineOrTrigger})` : ""}`, margin + 4, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const descLines = doc.splitTextToSize(ob.obligation, contentWidth - 35);
        doc.text(descLines[0] || ob.obligation, margin + 4, y + 10);

        // Status badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(isUrgent ? 185 : 71, isUrgent ? 28 : 85, isUrgent ? 28 : 105);
        doc.text(isUrgent ? "CRITICAL" : "STANDARD", pageWidth - margin - 4, y + 7, { align: "right" });

        y += 16;
      });

      // Key Dates and Deadlines if available
      if (analysis.keyDatesAndDeadlines && analysis.keyDatesAndDeadlines.length > 0) {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text("Significant Dates & Trigger Windows:", margin, y);
        y += 5;

        analysis.keyDatesAndDeadlines.slice(0, 4).forEach((kd) => {
          checkPageBreak(10);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(79, 70, 229);
          doc.text(`* ${kd.event}: `, margin + 2, y);
          const eventW = doc.getTextWidth(`* ${kd.event}: `);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(`${kd.timeframe} - ${kd.actionRequired}`, margin + 2 + eventW, y);
          y += 4.5;
        });
        y += 3;
      }
    }

    // ================= SECTION 3: HIDDEN TRAPS & GOTCHAS =================
    if (includeTraps && analysis && analysis.hiddenTrapsOrGotchas && analysis.hiddenTrapsOrGotchas.length > 0) {
      drawSectionHeader("3. High-Risk Hidden Clauses & Gotchas", "Provisions that frequently cause dispute, liability, or unilateral disadvantage.");

      analysis.hiddenTrapsOrGotchas.slice(0, 4).forEach((trap, i) => {
        checkPageBreak(22);
        doc.setDrawColor(254, 202, 202); // red-200
        doc.setFillColor(254, 242, 242); // red-50
        doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(153, 27, 27); // red-800
        doc.text(`[ALERT ${i + 1}] ${trap.title}`, margin + 4, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.8);
        doc.setTextColor(51, 65, 85);
        const trapDesc = doc.splitTextToSize(`Risk: ${trap.description}`, contentWidth - 8);
        doc.text(trapDesc[0] || trap.description, margin + 4, y + 9.5);

        doc.setFont("helvetica", "italic");
        doc.setTextColor(185, 28, 28);
        const mitLines = doc.splitTextToSize(`Action/Ask: ${trap.mitigationOrQuestion}`, contentWidth - 8);
        doc.text(mitLines[0] || trap.mitigationOrQuestion, margin + 4, y + 14.5);

        y += 21;
      });
    }

    // ================= SECTION 4: ATTORNEY CONSULTATION BRIEF =================
    if (includeAttorneyBrief) {
      if (attorneyBrief) {
        drawSectionHeader(
          "4. Attorney Consultation Brief & Strategy Dossier",
          "Structured brief prepared specifically for review with your legal counsel."
        );

        // Client Objective
        if (attorneyBrief.clientObjective) {
          checkPageBreak(18);
          doc.setFillColor(240, 253, 250); // teal-50
          doc.setDrawColor(153, 246, 228); // teal-200
          doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 118, 110); // teal-700
          doc.text("CLIENT OBJECTIVE & CONCERNS:", margin + 4, y + 5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(19, 78, 74);
          const objLines = doc.splitTextToSize(attorneyBrief.clientObjective, contentWidth - 8);
          doc.text(objLines[0] || attorneyBrief.clientObjective, margin + 4, y + 10);
          y += 17;
        }

        // Executive Brief for Attorney
        if (attorneyBrief.executiveBrief) {
          checkPageBreak(25);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text("Factual Summary for Counsel:", margin, y);
          y += 5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          const execLines = doc.splitTextToSize(attorneyBrief.executiveBrief, contentWidth);
          doc.text(execLines, margin, y);
          y += execLines.length * 4.3 + 5;
        }

        // Key Issues & Potential Exposures
        if (attorneyBrief.keyIssuesIdentified && attorneyBrief.keyIssuesIdentified.length > 0) {
          checkPageBreak(22);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text("Key Legal Issues Identified & Legal Exposure:", margin, y);
          y += 5;

          attorneyBrief.keyIssuesIdentified.forEach((issue, idx) => {
            checkPageBreak(16);
            doc.setDrawColor(226, 232, 240);
            doc.setFillColor(255, 255, 255);
            doc.rect(margin, y, contentWidth, 13, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(issue.priority === "HIGH" ? 185 : 51, issue.priority === "HIGH" ? 28 : 65, issue.priority === "HIGH" ? 28 : 85);
            doc.text(`Issue ${idx + 1} [${issue.priority} PRIORITY]: ${issue.issue}`, margin + 3, y + 4.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`Ref: ${issue.clauseReference || "Document"}  |  Exposure: ${issue.potentialExposure}`, margin + 3, y + 9.5);

            y += 15;
          });
          y += 2;
        }

        // Prioritized Questions to Ask Attorney
        if (attorneyBrief.prioritizedAttorneyQuestions && attorneyBrief.prioritizedAttorneyQuestions.length > 0) {
          checkPageBreak(24);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text("Prioritized Questions to Ask Your Attorney:", margin, y);
          y += 5;

          attorneyBrief.prioritizedAttorneyQuestions.forEach((q, idx) => {
            checkPageBreak(22);
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(79, 70, 229);
            doc.text(`Q${idx + 1}: ${q.question}`, margin + 3, y + 5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(71, 85, 105);
            doc.text(`Strategic Reason: ${q.strategicReason}`, margin + 3, y + 10);

            doc.setFont("helvetica", "italic");
            doc.setTextColor(15, 118, 110);
            doc.text(`Desired Outcome: ${q.desiredOutcome}`, margin + 3, y + 14.5);

            y += 21;
          });
        }

        // Recommended Redlines & Counterproposals
        if (attorneyBrief.recommendedRedlinesOrCounterproposals && attorneyBrief.recommendedRedlinesOrCounterproposals.length > 0) {
          checkPageBreak(24);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(30, 41, 59);
          doc.text("Recommended Redlines & Counterproposals to Discuss:", margin, y);
          y += 5;

          attorneyBrief.recommendedRedlinesOrCounterproposals.forEach((redline, idx) => {
            checkPageBreak(26);
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(margin, y, contentWidth, 23, 1.5, 1.5, "FD");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(30, 41, 59);
            doc.text(`Redline Proposal ${idx + 1} (${redline.section || "Clause"}):`, margin + 3, y + 4.5);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(185, 28, 28);
            const probLines = doc.splitTextToSize(`Current Term: "${redline.currentProblematicTerm}"`, contentWidth - 6);
            doc.text(probLines[0] || redline.currentProblematicTerm, margin + 3, y + 10);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            const revLines = doc.splitTextToSize(`Proposed Revision: "${redline.proposedRevision}"`, contentWidth - 6);
            doc.text(revLines[0] || redline.proposedRevision, margin + 3, y + 16.5);

            y += 26;
          });
        }

        // Documents to Bring
        if (attorneyBrief.documentsToBringToMeeting && attorneyBrief.documentsToBringToMeeting.length > 0) {
          checkPageBreak(18);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(30, 41, 59);
          doc.text("Checklist: Documents & Evidence to Bring to Consultation:", margin, y);
          y += 5;

          attorneyBrief.documentsToBringToMeeting.forEach((item) => {
            checkPageBreak(7);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(`[ ]  ${item}`, margin + 3, y);
            y += 4.5;
          });
          y += 3;
        }
      } else {
        // Note that brief was not yet generated
        checkPageBreak(24);
        drawSectionHeader("4. Attorney Consultation Brief", "Status: Not yet generated for this document session.");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(
          "An attorney brief can be formulated anytime in the 'Attorney Prep' tab with customized client objectives.",
          margin,
          y
        );
        y += 8;
      }
    }

    // ================= LEGAL NOTICE / FOOTER =================
    checkPageBreak(20);
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("IMPORTANT LEGAL NOTICE & DISCLAIMER:", margin, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    const disclaimer =
      "This document is generated by Legal Document Navigator as an AI-powered informational synthesis and client consultation intake aid. It does NOT constitute legal advice, does NOT establish an attorney-client relationship, and must NOT replace counsel licensed in your jurisdiction. Always review with a qualified attorney.";
    const discLines = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(discLines, margin, y);

    // ================= MULTI-PAGE NUMBERING & RUNNING HEADERS =================
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Running header (pages 2+)
      if (i > 1) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text("Legal Document Navigator | Client Consultation Intake Dossier", margin, 10);
        doc.text(document.title.slice(0, 45), pageWidth - margin, 10, { align: "right" });
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, 12, pageWidth - margin, 12);
      }

      // Running footer (all pages)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`CONFIDENTIAL - PREPARED FOR LEGAL CONSULTATION`, margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    // Sanitize filename
    const cleanTitle = document.title
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 40);
    const filename = `${cleanTitle}_Legal_Analysis_Brief.pdf`;

    doc.save(filename);
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    return false;
  }
}
