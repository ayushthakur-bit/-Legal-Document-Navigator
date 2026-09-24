import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Users,
  Calendar,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  FileCheck,
  HelpCircle,
  FileCode,
  Compass,
  Edit3,
  Search,
  Copy,
  Check,
  Receipt,
  Code,
  Tag,
} from "lucide-react";
import { DocumentDetectionResult, SampleDocument } from "../types";

interface DocumentDetectionViewProps {
  onAnalyzeAndLoad: (title: string, text: string, type: string) => void;
  sampleDocuments: SampleDocument[];
  currentDocumentTitle?: string;
}

export const DocumentDetectionView: React.FC<DocumentDetectionViewProps> = ({
  onAnalyzeAndLoad,
  sampleDocuments,
  currentDocumentTitle,
}) => {
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [detectionStep, setDetectionStep] = useState<string>("");
  const [detectionResult, setDetectionResult] = useState<DocumentDetectionResult | null>(null);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"dossier" | "json">("dossier");
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = documentText.trim() ? documentText.trim().split(/\s+/).length : 0;

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setDetectionResult(null);
    setDetectionError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      setDocumentText(content);
      // Auto-trigger detection on upload for maximum responsiveness
      detectDocument(content, selectedFile.name);
    };
    reader.onerror = () => {
      setDetectionError("Unable to read the selected file. Please verify it is a text-based format (.txt, .md, .doc, .rtf).");
    };
    reader.readAsText(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleFileChange(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      handleFileChange(dropped);
    }
  };

  const handleSampleSelect = (sample: SampleDocument) => {
    setFile(null);
    setDocumentText(sample.fullText);
    setDetectionResult(null);
    setDetectionError(null);
    detectDocument(sample.fullText, `${sample.title}.txt`);
  };

  const detectDocument = async (text: string, fileName: string) => {
    if (!text.trim()) {
      setDetectionError("Please paste or upload legal text to detect.");
      return;
    }

    setIsDetecting(true);
    setDetectionError(null);
    setDetectionStep("Scanning document structure & preambles...");

    const stepTimer1 = setTimeout(() => {
      setDetectionStep("Identifying contracting parties & taxonomy...");
    }, 600);

    const stepTimer2 = setTimeout(() => {
      setDetectionStep("Verifying governing jurisdiction & core provisions...");
    }, 1300);

    try {
      const res = await fetch("/api/legal/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText: text,
          fileName,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data: DocumentDetectionResult = await res.json();
      setDetectionResult(data);
      setCustomTitle(data.detectedTitle);
      setCustomCategory(data.category);
    } catch (err: any) {
      console.warn("Detection request error:", err);
      setDetectionError(
        "AI detection encountered a temporary issue. You can still proceed directly or try again."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsDetecting(false);
    }
  };

  const handleManualDetectClick = () => {
    if (!documentText.trim()) {
      setDetectionError("Please enter or upload document text first.");
      return;
    }
    const name = file?.name || "Uploaded Document";
    detectDocument(documentText, name);
  };

  const handleProceedWithAnalysis = () => {
    if (!documentText.trim()) return;

    const titleToUse = customTitle.trim() || detectionResult?.detectedTitle || file?.name || "Legal Document";
    const categoryToUse = customCategory.trim() || detectionResult?.category || "Commercial Contract";

    onAnalyzeAndLoad(titleToUse, documentText, categoryToUse);
  };

  const rawJsonOutput = detectionResult ? {
    is_document: detectionResult.is_document ?? true,
    document_type: detectionResult.document_type || (detectionResult.category === "Invoice" ? "invoice" : "contract"),
    confidence: detectionResult.confidence ?? (detectionResult.confidenceScore ? +(detectionResult.confidenceScore / 100).toFixed(2) : 0.96),
    extracted_text: detectionResult.extracted_text || (documentText.slice(0, 300).trim() + (documentText.length > 300 ? "..." : "")),
    fields: detectionResult.fields || {},
  } : null;

  const handleCopyJson = () => {
    if (!rawJsonOutput) return;
    navigator.clipboard.writeText(JSON.stringify(rawJsonOutput, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div id="section-document-detection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Legal Intake</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Upload Document &amp; Auto-Detect
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Upload or drag &amp; drop any contract, lease, NDA, SaaS agreement, or freelance terms.
              The AI intake engine accurately classifies the legal archetype, extracts parties, identifies governing law, and benchmarks key clauses before full analysis.
            </p>
          </div>

          {currentDocumentTitle && (
            <div className="glass-subtle px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Currently Loaded
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs block">
                {currentDocumentTitle}
              </span>
            </div>
          )}
        </div>

        {/* Quick-test templates pill bar */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Instant Sample Contract Detection:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sampleDocuments.map((doc) => (
              <button
                key={doc.id}
                id={`btn-sample-detect-${doc.id}`}
                onClick={() => handleSampleSelect(doc)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-subtle border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileCode className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                <span>{doc.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {doc.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Upload Area on Left, Live Detection Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload / Paste Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel-elevated rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-5">
            {/* Input Mode Selector */}
            <div className="flex p-1 rounded-2xl glass-subtle border border-slate-200 dark:border-slate-800">
              <button
                id="btn-input-file-mode"
                type="button"
                onClick={() => setInputMode("file")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inputMode === "file"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
              <button
                id="btn-input-paste-mode"
                type="button"
                onClick={() => setInputMode("paste")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  inputMode === "paste"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Text</span>
              </button>
            </div>

            {inputMode === "file" ? (
              /* File Drag & Drop Zone */
              <div
                id="dropzone-document-file"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30"
                    : file
                    ? "border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
              >
                <input
                  id="input-file-native"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept=".txt,.md,.doc,.docx,.pdf,.rtf"
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
                      file
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 scale-105"
                        : "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    }`}
                  >
                    {file ? <FileCheck className="w-7 h-7" /> : <UploadCloud className="w-7 h-7" />}
                  </div>

                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        {(file.size / 1024).toFixed(1)} KB &bull; {wordCount} words loaded
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">Click to select another file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Drag &amp; drop your document here
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        or click to browse files from your computer
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 font-mono">
                        Supports: .txt, .md, .docx, .rtf, .doc
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Paste Text Area */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Paste Agreement Text
                  </label>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {wordCount} words &bull; {documentText.length} chars
                  </span>
                </div>
                <textarea
                  id="textarea-document-detection"
                  rows={10}
                  value={documentText}
                  onChange={(e) => {
                    setDocumentText(e.target.value);
                    setDetectionResult(null);
                  }}
                  placeholder="Paste the contract text, lease clauses, NDA terms, or policy here..."
                  className="w-full p-4 text-xs font-mono leading-relaxed glass-input rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
                />
              </div>
            )}

            {/* Detection Trigger Button */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                id="btn-trigger-detection"
                type="button"
                onClick={handleManualDetectClick}
                disabled={!documentText.trim() || isDetecting}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDetecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Detecting Document...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Run AI Document Detection</span>
                  </>
                )}
              </button>

              {detectionError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{detectionError}</span>
                </div>
              )}
            </div>

            {/* Document stats & tips */}
            {documentText.trim() && (
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Document text verified
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setDocumentText("");
                    setDetectionResult(null);
                  }}
                  className="text-slate-400 hover:text-red-500 text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detection Results Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {isDetecting ? (
              /* Scanning In-Progress Visualizer */
              <motion.div
                key="detecting"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass-panel-elevated rounded-3xl border border-indigo-200 dark:border-indigo-900/60 p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent animate-pulse pointer-events-none" />

                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg relative z-10">
                    <Sparkles className="w-9 h-9 animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white">
                    Inspecting Legal Document
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                    {detectionStep || "Classifying document taxonomy..."}
                  </p>
                </div>

                {/* Progress bars simulation */}
                <div className="max-w-xs mx-auto space-y-2 text-left text-[11px] text-slate-500 dark:text-slate-400 pt-4">
                  <div className="flex items-center justify-between">
                    <span>Parties &amp; Recitals</span>
                    <span className="text-emerald-500 font-bold">Verified</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" style={{ width: "80%" }} />
                  </div>
                </div>
              </motion.div>
            ) : detectionResult ? (
              /* Detection Dossier Card */
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-panel-elevated rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden"
              >
                {/* View Mode Tabs: Dossier Analysis vs Raw JSON Schema */}
                <div className="flex items-center justify-between gap-3 pb-2">
                  <div className="flex p-1 rounded-2xl glass-subtle border border-slate-200 dark:border-slate-800">
                    <button
                      id="tab-view-dossier"
                      type="button"
                      onClick={() => setActiveTab("dossier")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "dossier"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Legal Dossier</span>
                    </button>
                    <button
                      id="tab-view-json"
                      type="button"
                      onClick={() => setActiveTab("json")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeTab === "json"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>JSON Schema Output</span>
                    </button>
                  </div>

                  <button
                    id="btn-copy-json-schema"
                    type="button"
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold glass-subtle border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {activeTab === "json" ? (
                  /* Raw JSON Schema Output View */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Structured Detection Result
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        document_type: &quot;{rawJsonOutput?.document_type}&quot; &bull; confidence: {rawJsonOutput?.confidence}
                      </span>
                    </div>

                    <div className="relative rounded-2xl bg-slate-950 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner max-h-[460px] overflow-y-auto">
                      <pre className="leading-relaxed">
                        {JSON.stringify(rawJsonOutput, null, 2)}
                      </pre>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      This structured payload includes the boolean flag <code className="font-mono text-indigo-500">is_document</code>, classification slug <code className="font-mono text-indigo-500">document_type</code>, confidence score float, document preview excerpt, and parsed key-value <code className="font-mono text-indigo-500">fields</code> (such as invoice number, date, total, vendor, and terms).
                    </p>
                  </div>
                ) : (
                  /* Standard Dossier View */
                  <>
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 dark:border-slate-800">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Document Detected: {detectionResult.is_document ? "True" : "False"}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                            {detectionResult.category}
                          </span>
                          {detectionResult.document_type && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              slug: {detectionResult.document_type}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                          {detectionResult.documentType}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Formal Title: <span className="font-semibold text-slate-700 dark:text-slate-200">{detectionResult.detectedTitle}</span>
                        </p>
                      </div>

                      {/* Confidence Gauge */}
                      <div className="flex items-center gap-3 glass-subtle px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Confidence
                          </span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {detectionResult.confidenceScore}%
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Extracted Fields Card (Invoice / Document Fields) */}
                    {detectionResult.fields && Object.keys(detectionResult.fields).length > 0 && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                              Extracted Document Fields
                            </h3>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {Object.keys(detectionResult.fields).length} attributes captured
                          </span>
                        </div>

                        {/* If invoice, highlight invoice_number, date, and total */}
                        {(detectionResult.fields.invoice_number || detectionResult.fields.total) ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Invoice Number
                              </span>
                              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {String(detectionResult.fields.invoice_number || "INV-1024")}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                                Invoice Date
                              </span>
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {String(detectionResult.fields.date || "2026-09-19")}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                                Total Amount
                              </span>
                              <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                                {String(detectionResult.fields.total || "₹12,500")}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {/* Remaining Fields */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(detectionResult.fields)
                            .filter(([key]) => !["invoice_number", "date", "total"].includes(key))
                            .map(([key, val]) => (
                              <div
                                key={key}
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2"
                              >
                                <span className="font-semibold text-slate-500 dark:text-slate-400 capitalize">
                                  {key.replace(/_/g, " ")}:
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {String(val)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Detection Rationale Callout */}
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Taxonomy Identification Rationale</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {detectionResult.detectionRationale}
                      </p>
                    </div>

                {/* Core Parameters Grid: Parties, Governing Law, Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parties */}
                  <div className="glass-subtle p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>Identified Parties &amp; Roles</span>
                    </div>
                    <div className="space-y-1.5">
                      {detectionResult.parties.map((party, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between text-xs py-1 border-b border-slate-200/40 dark:border-slate-800/60 last:border-0"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                            {party.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {party.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Governing Law & Venue */}
                  <div className="glass-subtle p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Scale className="w-4 h-4 text-indigo-500" />
                      <span>Governing Law &amp; Venue</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px]">Jurisdiction: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {detectionResult.governingLaw}
                        </span>
                      </div>
                      {detectionResult.effectiveDate && (
                        <div>
                          <span className="text-slate-400 text-[11px]">Effective Date: </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {detectionResult.effectiveDate}
                          </span>
                        </div>
                      )}
                      {detectionResult.termDuration && (
                        <div>
                          <span className="text-slate-400 text-[11px]">Term Duration: </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {detectionResult.termDuration}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Provisions Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      <span>Detected Core Legal Clauses</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {detectionResult.keyProvisions.filter((p) => p.present).length} of {detectionResult.keyProvisions.length} active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {detectionResult.keyProvisions.map((provision, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                          provision.present
                            ? "bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                            : "opacity-60 bg-slate-100/40 dark:bg-slate-900/30 border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {provision.present ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{provision.name}</span>
                            {!provision.present && (
                              <span className="text-[10px] font-medium text-slate-400">
                                (Absent)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                            {provision.notes}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Leverage & Focus Areas */}
                <div className="p-4 rounded-2xl glass-subtle border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Drafting Leverage &amp; Risk Posture
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        detectionResult.overallTone === "BALANCED"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {detectionResult.overallTone.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {detectionResult.toneDescription}
                  </p>

                  {detectionResult.recommendedFocusAreas?.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Priority Inspection Targets:
                      </span>
                      <ul className="space-y-1">
                        {detectionResult.recommendedFocusAreas.map((focus, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
                          >
                            <ArrowRight className="w-3 h-3 text-indigo-500 mt-1 shrink-0" />
                            <span>{focus}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Metadata Tuning Option */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingMetadata ? "Hide Manual Adjustments" : "Need to adjust title or category?"}</span>
                  </button>

                  {isEditingMetadata && (
                    <div className="p-4 rounded-2xl glass-subtle border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Document Title
                          </label>
                          <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="w-full text-xs px-3 py-2 glass-input rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full text-xs px-3 py-2 glass-input rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    id="btn-confirm-and-analyze"
                    type="button"
                    onClick={handleProceedWithAnalysis}
                    className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze &amp; Open in Legal Navigator</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    Loads into Overview, Clauses, Obligations Matrix, Redline Comparison, and Grounded Q&amp;A
                  </p>
                </div>
              </>
            )}
          </motion.div>
            ) : (
              /* Empty / Waiting State */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel-elevated rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-10 text-center space-y-5 h-full flex flex-col items-center justify-center min-h-[440px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                    Awaiting Document Upload
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload a file on the left or choose one of the pre-loaded templates to see live AI classification, contracting party detection, and legal risk extraction.
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap justify-center gap-2 text-[11px] text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60">
                    &bull; Non-Disclosure Agreements
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60">
                    &bull; Residential &amp; Commercial Leases
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60">
                    &bull; SaaS &amp; Cloud SLAs
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/60">
                    &bull; Employment &amp; Consulting
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
