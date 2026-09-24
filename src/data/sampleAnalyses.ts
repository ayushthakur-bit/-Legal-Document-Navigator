import { AnalysisResult } from "../types";

export const PRECOMPUTED_SAMPLE_ANALYSES: Record<string, AnalysisResult> = {
  "residential-lease": {
    summary:
      "A standard landlord-drafted residential apartment lease with severe tenant-unfriendly clauses including automatic 12-month renewal at 10% rent escalation with 60-day certified mail notice requirement, unilateral landlord entry rights, unconditional forfeiture of a 2-month security deposit, full tenant liability for plumbing/repairs up to $350, and a total waiver of jury trial and fee shifting.",
    structuredSummary: {
      keyPoints: [
        "12-month initial lease term at $2,450/month with aggressive $150 late fee after day 3 plus $25/day thereafter.",
        "Automatic 12-month renewal with 10% rent hike unless 60-day advance notice sent strictly via certified postal mail.",
        "Unilateral landlord entry without prior notice in urgent situations or during final 45 days of tenancy.",
        "Tenant indemnifies landlord for water damage and plumbing clogs regardless of cause.",
        "Complete waiver of jury trial and tenant pays landlord legal fees in any dispute regardless of outcome.",
      ],
      partiesInvolved: [
        { name: "Apex Metro Properties LLC", role: "Landlord" },
        { name: "Tenant(s)", role: "Lessee / Resident" },
      ],
      purposeOfAgreement: "Leasing of residential premises (Apartment 4B, 742 Evergreen Terrace).",
      duration: "12 Calendar Months (November 1, 2025 to October 31, 2026) with automatic extension.",
    },
    financialTerms: {
      baseCompensationOrRent: "$2,450.00 USD per month",
      depositOrRetainer: "$4,900.00 USD (Two months' rent) security deposit",
      penaltiesAndLateFees: "$150 flat fee after day 3 plus $25/day compounding penalty",
      expensePassThroughs: "Tenant pays minor repairs up to $350 per incident regardless of fault.",
    },
    overallRiskRating: "CRITICAL",
    riskScore: 88,
    riskSummary:
      "Extremely one-sided contract with automatic renewal traps, unilateral access rights, disproportionate deposit forfeiture, and one-way legal fee shifting.",
    readingGradeLevel: "College Senior (Grade 16)",
    simplifiedGradeLevel: "Grade 8",
    keyParties: ["Apex Metro Properties LLC (Landlord)", "Tenant (Resident)"],
    keyClauses: [
      {
        clauseTitle: "Automatic Renewal & Certified Post Notice",
        originalSnippet:
          "THIS AGREEMENT SHALL AUTOMATICALLY RENEW FOR AN ADDITIONAL SUCCESSIVE TWELVE (12) MONTH PERIOD AT A TEN PERCENT (10%) INCREASE IN BASE RENT, UNLESS TENANT PROVIDES WRITTEN NOTICE OF INTENT TO VACATE VIA CERTIFIED POST NOT LESS THAN SIXTY (60) CALENDAR DAYS PRIOR TO THE EXPIRATION DATE. ORAL NOTICE OR ELECTRONIC MAIL SHALL BE DEEMED NULL AND VOID.",
        plainEnglish:
          "If you forget to send a physical certified letter 60 days before your lease ends, you are automatically locked in for another full year with a 10% rent increase ($2,695/mo). Email notice is explicitly void.",
        riskLevel: "CRITICAL",
        whyItMatters:
          "Very easy to miss the 60-day window and forfeit thousands of dollars. Email notifications are rejected by design.",
        category: "Renewal & Termination",
      },
      {
        clauseTitle: "Unilateral Right of Entry",
        originalSnippet:
          "Landlord may enter at any time without prior notification during the final forty-five (45) days of tenancy, or in circumstances deemed urgent by Landlord.",
        plainEnglish:
          "During the last 45 days of your lease, the landlord or brokers can enter your home at any hour without any warning.",
        riskLevel: "CAUTION",
        whyItMatters: "Deprives tenant of covenant of quiet enjoyment and privacy.",
        category: "Tenant Privacy",
      },
      {
        clauseTitle: "One-Sided Legal Fees & Jury Trial Waiver",
        originalSnippet:
          "TENANT SHALL PAY LANDLORD'S REASONABLE ATTORNEYS' FEES REGARDLESS OF THE FINAL JUDGMENT. TENANT HEREBY IRREVOCABLY WAIVES ALL RIGHTS TO TRIAL BY JURY.",
        plainEnglish:
          "Even if the landlord violates the law and you win in court, this clause attempts to force you to pay the landlord's lawyers.",
        riskLevel: "CRITICAL",
        whyItMatters:
          "Blatantly one-sided fee shifting designed to intimidate tenants from asserting legal rights.",
        category: "Dispute Resolution",
      },
    ],
    obligations: [
      {
        party: "Tenant",
        obligation: "Pay monthly rent on or before the 1st of each calendar month.",
        deadlineOrTrigger: "1st of every month (grace period ends day 3)",
        consequenceOfBreach: "$150 immediate late fee plus $25 per calendar day",
        isCrucial: true,
      },
      {
        party: "Tenant",
        obligation: "Provide written intent to vacate via certified post.",
        deadlineOrTrigger: "60 calendar days prior to October 31, 2026",
        consequenceOfBreach: "Automatic 12-month extension with 10% rent increase",
        isCrucial: true,
      },
      {
        party: "Tenant",
        obligation: "Cover costs of drain clogs and minor plumbing repairs up to $350.",
        deadlineOrTrigger: "Per maintenance incident",
        consequenceOfBreach: "Deduction from deposit or default notice",
        isCrucial: false,
      },
    ],
    hiddenTrapsOrGotchas: [
      {
        title: "Certified Mail Only Requirement",
        description:
          "Disallowing email for non-renewal is a notorious landlord trap to force automatic contract extension.",
        mitigationOrQuestion:
          "Strike 'ORAL NOTICE OR ELECTRONIC MAIL SHALL BE DEEMED NULL AND VOID' and replace with standard email notice.",
      },
      {
        title: "Deposit Forfeiture as Liquidated Damages",
        description:
          "Landlord retains full $4,900 deposit even if an early replacement tenant is found within days.",
        mitigationOrQuestion:
          "Request statutory mitigation clause: Landlord must use reasonable efforts to re-let premises.",
      },
      {
        title: "Pay Landlord Legal Fees Regardless of Judgment",
        description:
          "Clause forces tenant to pay landlord attorneys' fees even if tenant wins the lawsuit.",
        mitigationOrQuestion: "Change to mutual 'prevailing party' legal fee recovery.",
      },
    ],
    keyDatesAndDeadlines: [
      {
        event: "Rent Due Date",
        timeframe: "1st of every calendar month",
        actionRequired: "Submit payment by 11:59 PM to avoid penalty.",
      },
      {
        event: "Late Fee Assessment",
        timeframe: "4th calendar day of the month",
        actionRequired: "$150 late fee assessed automatically.",
      },
      {
        event: "60-Day Non-Renewal Notice Deadline",
        timeframe: "September 1, 2026 (60 days prior to expiry)",
        actionRequired: "Send certified letter to landlord address stating intent to vacate.",
      },
      {
        event: "Unrestricted Entry Window",
        timeframe: "September 16, 2026 - October 31, 2026",
        actionRequired: "Prepare for potential landlord visits without advance notice.",
      },
    ],
    legalGlossary: [
      {
        term: "Liquidated Damages",
        plainDefinition:
          "A predetermined sum of money agreed upon in advance that one party must pay if they break the contract.",
      },
      {
        term: "Quiet Enjoyment",
        plainDefinition:
          "The fundamental legal right of a tenant to inhabit their home without unreasonable landlord intrusion.",
      },
      {
        term: "Fee Shifting",
        plainDefinition:
          "A contractual rule deciding which party pays the lawyers' bills at the conclusion of a legal lawsuit.",
      },
    ],
    preSigningChecklist: [
      {
        id: "chk-1",
        item: "Negotiate email notice as valid written notification for lease termination.",
        importance: "CRITICAL",
        category: "Termination",
        completed: false,
      },
      {
        id: "chk-2",
        item: "Require mandatory 24-hour written advance notice for all non-emergency entries.",
        importance: "CRITICAL",
        category: "Privacy",
        completed: false,
      },
      {
        id: "chk-3",
        item: "Remove clause making tenant pay landlord legal fees when tenant prevails.",
        importance: "CRITICAL",
        category: "Legal Protection",
        completed: false,
      },
      {
        id: "chk-4",
        item: "Cap security deposit deduction strictly to documented repair costs beyond normal wear.",
        importance: "RECOMMENDED",
        category: "Financial",
        completed: false,
      },
    ],
  },

  "employment-agreement": {
    summary:
      "An aggressive corporate tech employment agreement containing an expansive 24-month nationwide non-compete, blanket intellectual property assignment over off-duty personal hobbies, strict at-will termination with zero severance, broad non-disparagement, and mandatory binding arbitration in New York.",
    structuredSummary: {
      keyPoints: [
        "Senior Systems Architect role with $165,000 base salary and strict at-will termination.",
        "Overreaching IP assignment capturing inventions created on personal equipment during off-duty hours.",
        "24-month non-compete spanning the entire US and Canada for any competing line of business.",
        "Immediate cessation of unvested stock options upon termination for any reason.",
        "Mandatory confidential binding arbitration in New York with class action waiver.",
      ],
      partiesInvolved: [
        { name: "Vortex Dynamics Inc.", role: "Employer / Company" },
        { name: "Employee", role: "Senior Systems Architect" },
      ],
      purposeOfAgreement: "Employment terms, intellectual property transfer, and post-employment covenants.",
      duration: "At-will employment; restrictive covenants extend 24 months post-termination.",
    },
    financialTerms: {
      baseCompensationOrRent: "$165,000.00 USD annualized base salary",
      depositOrRetainer: "N/A",
      penaltiesAndLateFees: "Immediate loss of unvested stock options upon departure.",
      expensePassThroughs: "Mandatory arbitration in NY with cost allocation governed by AAA rules.",
    },
    overallRiskRating: "CRITICAL",
    riskScore: 92,
    riskSummary:
      "Severely restricts worker career mobility for two years and expropriates personal software and inventions built on personal time.",
    readingGradeLevel: "Graduate School",
    simplifiedGradeLevel: "Grade 9",
    keyParties: ["Vortex Dynamics Inc. (Company)", "Employee (Systems Architect)"],
    keyClauses: [
      {
        clauseTitle: "Universal IP & Personal Invention Assignment",
        originalSnippet:
          "Employee hereby assigns to Company all right, title, and interest in and to any and all inventions, codebases, software... REGARDLESS OF WHETHER CONCEIVED ON COMPANY TIME OR WITH COMPANY ASSETS, OR DEVELOPED ON EMPLOYEE'S OWN PERSONAL EQUIPMENT DURING NON-WORKING HOURS.",
        plainEnglish:
          "The company claims ownership of any software, open source project, or app you build on your own laptop on weekends, even if it has nothing to do with your job.",
        riskLevel: "CRITICAL",
        whyItMatters:
          "Expropriates your personal creative output and prevents side businesses or indie development.",
        category: "Intellectual Property",
      },
      {
        clauseTitle: "24-Month North American Non-Compete",
        originalSnippet:
          "During the term of employment and for a period of twenty-four (24) months following the termination... Employee shall not directly or indirectly engage in, advise, invest in, or provide services to any entity that competes... within the United States or Canada.",
        plainEnglish:
          "You cannot work for any tech competitor in North America for 2 whole years after leaving, which could completely freeze your engineering career.",
        riskLevel: "CRITICAL",
        whyItMatters:
          "May be legally void in states like California or Minnesota, but creates massive litigation risk elsewhere.",
        category: "Restrictive Covenants",
      },
    ],
    obligations: [
      {
        party: "Employee",
        obligation: "Devote full business time and exclusive loyalty without any outside commercial work.",
        deadlineOrTrigger: "Continuous throughout employment",
        consequenceOfBreach: "Immediate termination for cause and potential injunction",
        isCrucial: true,
      },
      {
        party: "Employee",
        obligation: "Refrain from competing with company across US & Canada.",
        deadlineOrTrigger: "24 months following departure",
        consequenceOfBreach: "Injunctive relief and clawback of compensation",
        isCrucial: true,
      },
    ],
    hiddenTrapsOrGotchas: [
      {
        title: "Personal Equipment IP Seizure",
        description: "Captures weekend coding projects built with zero company equipment or trade secrets.",
        mitigationOrQuestion:
          "Add standard statutory carveout: 'Inventions developed on personal time without company trade secrets remain employee property.'",
      },
      {
        title: "Forfeiture of Stock Options",
        description: "Unvested options evaporate on termination regardless of employee performance.",
        mitigationOrQuestion: "Negotiate accelerated double-trigger vesting upon corporate change in control.",
      },
    ],
    keyDatesAndDeadlines: [
      {
        event: "Non-Compete Expiration",
        timeframe: "24 months after final employment date",
        actionRequired: "Must avoid prohibited employers or seek written waiver.",
      },
      {
        event: "Stock Option Exercise Window",
        timeframe: "Typically 90 days from departure",
        actionRequired: "Decide whether to exercise vested options before expiration.",
      },
    ],
    legalGlossary: [
      {
        term: "At-Will Employment",
        plainDefinition:
          "An employment relationship where either employer or employee can end the job at any time for any legal reason without penalty.",
      },
      {
        term: "Restrictive Covenant",
        plainDefinition:
          "A legal clause that prevents a person from doing certain actions (like working for a rival or soliciting clients) after leaving.",
      },
    ],
    preSigningChecklist: [
      {
        id: "emp-1",
        item: "Insert California/statutory IP carve-out for inventions created entirely on personal time.",
        importance: "CRITICAL",
        category: "Intellectual Property",
        completed: false,
      },
      {
        id: "emp-2",
        item: "Reduce non-compete to a 6-month non-solicitation of direct clients only.",
        importance: "CRITICAL",
        category: "Covenants",
        completed: false,
      },
      {
        id: "emp-3",
        item: "Require 4 weeks notice or severance pay if terminated without cause.",
        importance: "RECOMMENDED",
        category: "Severance",
        completed: false,
      },
    ],
  },

  "saas-master-services": {
    summary:
      "Enterprise B2B Software-as-a-Service subscription agreement with unilateral price increase provisions, unlimited customer indemnity for user-generated content, 99.0% SLA with minimal credit relief, and limitation of vendor liability to fees paid in previous 12 months.",
    structuredSummary: {
      keyPoints: [
        "Annual enterprise SaaS subscription with automatic annual renewal.",
        "Vendor may increase subscription fees by up to 15% upon renewal with 30 days notice.",
        "Customer indemnifies vendor against all third-party IP claims arising from data uploads.",
        "SLA target of 99.0% with maximum service credits capped at 10% of monthly fee.",
        "Vendor liability capped strictly at total fees paid in the preceding 12 months.",
      ],
      partiesInvolved: [
        { name: "CloudScale Systems Inc.", role: "SaaS Vendor" },
        { name: "Enterprise Customer", role: "Subscriber / Licensee" },
      ],
      purposeOfAgreement: "Licensing and provision of cloud enterprise software services.",
      duration: "12-month initial term with automatic 1-year renewals.",
    },
    financialTerms: {
      baseCompensationOrRent: "$36,000.00 USD annual subscription billed upfront",
      depositOrRetainer: "N/A",
      penaltiesAndLateFees: "1.5% monthly interest on overdue invoices",
      expensePassThroughs: "Vendor may increase fees by 15% annually upon renewal.",
    },
    overallRiskRating: "MODERATE",
    riskScore: 58,
    riskSummary:
      "Standard enterprise SaaS agreement with favorable terms for the vendor on SLA remedies, liability caps, and renewal pricing.",
    readingGradeLevel: "College Graduate",
    simplifiedGradeLevel: "Grade 10",
    keyParties: ["CloudScale Systems Inc. (Vendor)", "Enterprise Customer (Client)"],
    keyClauses: [
      {
        clauseTitle: "Annual Price Escalation Clause",
        originalSnippet:
          "Vendor reserves the right to adjust subscription pricing by up to fifteen percent (15%) upon each annual renewal by providing thirty (30) days prior electronic notice.",
        plainEnglish:
          "The vendor can raise your price by up to 15% each year, and only has to email you 30 days before renewal.",
        riskLevel: "CAUTION",
        whyItMatters:
          "Can cause substantial unexpected budget increases for business-critical software.",
        category: "Pricing & Renewal",
      },
      {
        clauseTitle: "Asymmetric Limitation of Liability",
        originalSnippet:
          "IN NO EVENT SHALL VENDOR'S TOTAL AGGREGATE LIABILITY EXCEED THE TOTAL AMOUNTS ACTUALLY PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
        plainEnglish:
          "If the vendor suffers a catastrophic data breach, the most you can ever recover in damages is what you paid them this year.",
        riskLevel: "CAUTION",
        whyItMatters:
          "A major data breach or enterprise downtime could cost your business far more than the annual subscription fee.",
        category: "Liability",
      },
    ],
    obligations: [
      {
        party: "Customer",
        obligation: "Pay subscription invoices within 30 days of receipt.",
        deadlineOrTrigger: "Net-30 payment terms",
        consequenceOfBreach: "1.5% monthly late fee and possible service suspension",
        isCrucial: true,
      },
      {
        party: "Vendor",
        obligation: "Maintain 99.0% monthly service uptime.",
        deadlineOrTrigger: "Monthly measurement period",
        consequenceOfBreach: "Service credits capped at 10% of monthly fee",
        isCrucial: false,
      },
    ],
    hiddenTrapsOrGotchas: [
      {
        title: "15% Renewal Escalation",
        description: "15% annual increase compounds quickly over a 3-5 year deployment.",
        mitigationOrQuestion: "Cap renewal price increases to CPI or maximum 3% per year.",
      },
      {
        title: "Service Credits as Sole Remedy",
        description: "If the system goes down for a whole week, you cannot cancel; you only receive a minor credit.",
        mitigationOrQuestion: "Add right to terminate with pro-rata refund if uptime falls below 95% in any calendar month.",
      },
    ],
    keyDatesAndDeadlines: [
      {
        event: "Renewal Opt-Out Deadline",
        timeframe: "45 days prior to annual contract anniversary",
        actionRequired: "Submit cancellation notice if switching providers.",
      },
    ],
    legalGlossary: [
      {
        term: "Service Level Agreement (SLA)",
        plainDefinition:
          "A formal commitment specifying the minimum percentage of time a cloud service must be online and functioning.",
      },
      {
        term: "Limitation of Liability",
        plainDefinition:
          "A contract cap that limits the maximum amount of financial damages one party can collect from another.",
      },
    ],
    preSigningChecklist: [
      {
        id: "saas-1",
        item: "Cap annual price escalation at 3% or CPI.",
        importance: "CRITICAL",
        category: "Pricing",
        completed: false,
      },
      {
        id: "saas-2",
        item: "Increase SLA uptime threshold from 99.0% to enterprise standard 99.9%.",
        importance: "RECOMMENDED",
        category: "SLA",
        completed: false,
      },
      {
        id: "saas-3",
        item: "Include a 'super-cap' for data breach and confidentiality indemnities.",
        importance: "CRITICAL",
        category: "Security",
        completed: false,
      },
    ],
  },
};
