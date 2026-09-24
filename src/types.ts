export type RiskLevel = "SAFE" | "CAUTION" | "CRITICAL";

export interface LegalClause {
  clauseTitle: string;
  originalSnippet: string;
  plainEnglish: string;
  riskLevel: RiskLevel;
  whyItMatters: string;
  category: string;
}

export interface ObligationItem {
  party: string;
  obligation: string;
  deadlineOrTrigger: string;
  consequenceOfBreach: string;
  isCrucial?: boolean;
}

export interface HiddenTrap {
  title: string;
  description: string;
  mitigationOrQuestion: string;
}

export interface KeyDateDeadline {
  event: string;
  timeframe: string;
  actionRequired: string;
}

export interface GlossaryItem {
  term: string;
  plainDefinition: string;
  exampleContext?: string;
}

export interface ChecklistItem {
  id: string;
  item: string;
  importance: "CRITICAL" | "RECOMMENDED" | "OPTIONAL";
  category: string;
  completed?: boolean;
}

export interface RiskFactorItem {
  name: string;
  points: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  rationale?: string;
}

export interface AnalysisResult {
  summary: string;
  overallRiskRating: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  riskScore: number;
  riskSummary: string;
  riskFactors?: RiskFactorItem[];
  readingGradeLevel: string;
  simplifiedGradeLevel: string;
  keyParties: string[];
  keyClauses: LegalClause[];
  obligations: ObligationItem[];
  hiddenTrapsOrGotchas: HiddenTrap[];
  keyDatesAndDeadlines: KeyDateDeadline[];
  legalGlossary: GlossaryItem[];
  preSigningChecklist: ChecklistItem[];
}

export interface KeyDifference {
  topic: string;
  docAPosition: string;
  docBPosition: string;
  significance: "CRITICAL" | "MODERATE" | "MINOR";
  impactOnUser: string;
}

export interface ComparisonResult {
  comparisonSummary: string;
  moreFavorableDocument: string;
  keyDifferences: KeyDifference[];
  newRisksIntroducedInB: string[];
  protectionsRemovedInB: string[];
  negotiationRecommendations: string[];
}

export interface AttorneyQuestion {
  question: string;
  strategicReason: string;
  desiredOutcome: string;
}

export interface RedlineSuggestion {
  section: string;
  currentProblematicTerm: string;
  proposedRevision: string;
}

export interface KeyIssueIdentified {
  issue: string;
  clauseReference: string;
  potentialExposure: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface AttorneyBriefResult {
  executiveBrief: string;
  clientObjective: string;
  keyIssuesIdentified: KeyIssueIdentified[];
  prioritizedAttorneyQuestions: AttorneyQuestion[];
  recommendedRedlinesOrCounterproposals: RedlineSuggestion[];
  documentsToBringToMeeting: string[];
}

export interface GroundedAnswer {
  answer: string;
  citations: string[];
  confidence: "HIGH" | "MODERATE" | "AMBIGUOUS_IN_TEXT" | string;
  relevantClauses?: string[];
  recommendation?: string;
  suggestedFollowUps?: string[];
  disclaimer?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citations?: string[];
  confidence?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
}

export interface SampleDocument {
  id: string;
  title: string;
  category: "Lease" | "Employment" | "SaaS & Tech" | "Freelance" | "Confidentiality (NDA)" | "Invoice";
  tag: string;
  description: string;
  fullText: string;
  suggestedQuestions: string[];
  comparisonPair?: {
    id: string;
    title: string;
    description: string;
    fullText: string;
  };
}

export interface DetectedParty {
  name: string;
  role: string;
}

export interface DetectedProvision {
  name: string;
  present: boolean;
  notes: string;
}

export interface DocumentDetectionResult {
  is_document: boolean;
  document_type: string;
  confidence: number;
  extracted_text: string;
  fields: Record<string, string | number | boolean>;

  detectedTitle: string;
  documentType: string;
  category: "Invoice" | "Receipt" | "Lease" | "Employment" | "SaaS & Tech" | "Freelance" | "Confidentiality (NDA)" | "Commercial Contract" | "Financial / Loan" | "General Legal";
  confidenceScore: number;
  confidenceLabel: "HIGH" | "MODERATE" | "LOW";
  detectionRationale: string;
  governingLaw: string;
  jurisdictionVenue?: string;
  parties: DetectedParty[];
  effectiveDate?: string;
  termDuration?: string;
  keyProvisions: DetectedProvision[];
  overallTone: "BALANCED" | "ONE_SIDED_FAVORS_FIRST_PARTY" | "ONE_SIDED_FAVORS_SECOND_PARTY" | "PROTECTIVE";
  toneDescription: string;
  recommendedFocusAreas: string[];
}

export interface RecentDocumentRecord {
  id: string;
  document: SampleDocument;
  analysis: AnalysisResult;
  analyzedAt: string;
  wordCount: number;
  comparisonResult?: ComparisonResult | null;
  attorneyBrief?: AttorneyBriefResult | null;
}
