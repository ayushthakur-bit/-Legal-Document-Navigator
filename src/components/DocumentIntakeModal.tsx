import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, FileText, Sparkles, Check, RefreshCw, ShieldCheck } from "lucide-react";
import { SampleDocument, DocumentDetectionResult } from "../types";

interface DocumentIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCustomDocument: (title: string, text: string, type: string) => void;
  sampleDocuments: SampleDocument[];
  onSelectSampleDocument: (doc: SampleDocument) => void;
}

export const DocumentIntakeModal: React.FC<DocumentIntakeModalProps> = ({
  isOpen,
  onClose,
  onLoadCustomDocument,
  sampleDocuments,
  onSelectSampleDocument,
}) => {
  const [activeMode, setActiveMode] = useState<"paste" | "samples">("paste");
  const [customTitle, setCustomTitle] = useState("");
  const [customType, setCustomType] = useState("Commercial Contract");
  const [customText, setCustomText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{
    type: string;
    confidence: number;
    parties?: string;
    invoiceDetails?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const runDetection = async (text: string, title?: string) => {
    if (!text.trim()) return;
    setIsDetecting(true);
    try {
      const res = await fetch("/api/legal/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentText: text, fileName: title || "Uploaded Document" }),
      });
      if (res.ok) {
        const data: DocumentDetectionResult = await res.json();
        if (data.detectedTitle) setCustomTitle(data.detectedTitle);
        if (data.category) setCustomType(data.category);

        let invoiceDetails = "";
        if (data.fields && (data.fields.invoice_number || data.fields.total)) {
          invoiceDetails = [
            data.fields.invoice_number ? `No. ${data.fields.invoice_number}` : "",
            data.fields.total ? `Total: ${data.fields.total}` : "",
          ].filter(Boolean).join(" | ");
        }

        setDetectedInfo({
          type: data.documentType,
          confidence: data.confidenceScore,
          parties: data.parties?.map((p) => p.name).join(" vs ") || "",
          invoiceDetails,
        });
      }
    } catch (err) {
      console.warn("Auto-detection in modal error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomText(content);
      const derivedTitle = file.name.replace(/\.[^/.]+$/, "");
      if (!customTitle) {
        setCustomTitle(derivedTitle);
      }
      runDetection(content, derivedTitle);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomText(content);
      const derivedTitle = file.name.replace(/\.[^/.]+$/, "");
      if (!customTitle) {
        setCustomTitle(derivedTitle);
      }
      runDetection(content, derivedTitle);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onLoadCustomDocument(
      customTitle.trim() || "Uploaded Legal Document",
      customText.trim(),
      customType
    );
    onClose();
  };

  const wordCount = customText.trim() ? customText.trim().split(/\s+/).length : 0;

  return (
    <div
      id="modal-document-intake"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel-elevated rounded-3xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full p-6 space-y-5 my-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-slate-900 dark:text-white">
                Provide or Select Legal Document
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analyze any agreement, contract, lease, privacy policy, or service terms
              </p>
            </div>
          </div>
          <button
            id="btn-close-intake-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex glass-subtle p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            id="btn-mode-paste"
            type="button"
            onClick={() => setActiveMode("paste")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMode === "paste"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Paste Text or Upload File
          </button>
          <button
            id="btn-mode-samples"
            type="button"
            onClick={() => setActiveMode("samples")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeMode === "samples"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Explore Pre-loaded Templates ({sampleDocuments.length})
          </button>
        </div>

        {activeMode === "paste" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  id="input-document-title"
                  type="text"
                  placeholder="e.g. Master Consulting Agreement"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agreement Category
                </label>
                <select
                  id="select-document-category"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                >
                  <option value="Commercial Contract">Commercial Contract / B2B</option>
                  <option value="Residential Lease">Residential Lease / Rental</option>
                  <option value="Employment Agreement">Employment / Restrictive Covenant</option>
                  <option value="Freelance & Consulting">Freelance & Independent Contractor</option>
                  <option value="Non-Disclosure Agreement">Confidentiality / NDA</option>
                  <option value="Terms of Service & Privacy">Terms of Service / Privacy Policy</option>
                  <option value="General Agreement">General / Other Agreement</option>
                </select>
              </div>
            </div>

            {/* Drag & drop or paste area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Document Full Text or Clauses
                </label>
                <span className="text-[11px] text-slate-400">
                  {wordCount > 0 ? `${wordCount} words` : "Paste or upload"}
                </span>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 rounded-2xl transition-all ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-50/20"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-400"
                }`}
              >
                <textarea
                  id="textarea-document-text"
                  rows={8}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste the contract, lease, employment terms, or policy clauses here..."
                  className="w-full p-3 text-xs text-slate-800 dark:text-slate-200 bg-transparent border-none focus:outline-none resize-y font-mono leading-relaxed"
                />

                <div className="p-2 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 rounded-b-2xl flex items-center justify-between">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.md,.doc,.docx"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload from file (.txt, .md)
                    </button>
                    {customText.trim() && (
                      <button
                        type="button"
                        onClick={() => runDetection(customText, customTitle)}
                        disabled={isDetecting}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        {isDetecting ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Detecting...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Auto-Detect Type</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Supports plain text &amp; markdown
                  </span>
                </div>
              </div>

              {detectedInfo && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">
                        Detected: {detectedInfo.type}
                      </span>
                      {detectedInfo.invoiceDetails ? (
                        <span className="text-emerald-700 dark:text-emerald-300 ml-1.5 text-[11px] font-mono">
                          &bull; {detectedInfo.invoiceDetails}
                        </span>
                      ) : detectedInfo.parties ? (
                        <span className="text-emerald-700 dark:text-emerald-300 ml-1.5 text-[11px]">
                          &bull; {detectedInfo.parties}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-[11px]">
                    {detectedInfo.confidence}% Match
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-submit-analyze"
                type="submit"
                disabled={!customText.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Document
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {sampleDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  onSelectSampleDocument(doc);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 glass-subtle hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {doc.category}
                    </span>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Load &rarr;
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-500" />
                  Ready with comparison version &amp; grounded Q&amp;A
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
