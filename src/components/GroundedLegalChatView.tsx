import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Quote,
  ShieldCheck,
  HelpCircle,
  RotateCcw,
  Check,
  Copy,
  AlertCircle,
  Mic,
  Eye,
  X,
  Globe,
  ExternalLink,
} from "lucide-react";
import { ChatMessage, GroundedEvidence } from "../types";

interface GroundedLegalChatViewProps {
  documentTitle: string;
  documentText: string;
  suggestedQuestions: string[];
  onAskQuestion: (q: string, includeGoogleSearch?: boolean) => Promise<any>;
  onSwitchToVoice?: () => void;
}

export const GroundedLegalChatView: React.FC<GroundedLegalChatViewProps> = ({
  documentTitle,
  documentText,
  suggestedQuestions,
  onAskQuestion,
  onSwitchToVoice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      sender: "assistant",
      text: `Hello! I am your grounded legal document assistant. I have indexed "${documentTitle}". You can ask any question about fee triggers, termination rights, notice deadlines, liability restrictions, or landlord entry covenants. Every answer is grounded directly in the document text, and can be verified against current state and federal statutes with live Google Search Grounding.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<GroundedEvidence | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnswering]);

  const handleSend = async (questionText?: string) => {
    const query = questionText || inputQuery;
    if (!query.trim() || isAnswering) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsAnswering(true);

    try {
      const result = await onAskQuestion(query.trim(), useSearchGrounding);

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: result.answer,
        citations: result.citations,
        confidence: result.confidence,
        suggestedFollowUps: result.suggestedFollowUps,
        evidence: result.evidence || (result.source ? {
          source: result.source,
          clauseTitle: result.clauseTitle || "Document Citation",
          quote: result.quote || (result.citations && result.citations[0]) || "",
        } : undefined),
        source: result.source,
        clauseTitle: result.clauseTitle,
        quote: result.quote,
        isOffTopic: result.isOffTopic,
        googleSearchSources: result.googleSearchSources,
        webSearchQueries: result.webSearchQueries,
        hasGoogleSearchGrounding: result.hasGoogleSearchGrounding,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `Sorry, I encountered an issue analyzing this question: ${err.message || "Unknown error"}. Please try rephrasing or asking a simpler question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "initial-msg-reset",
        sender: "assistant",
        text: `Chat session reset for "${documentTitle}". Ready for your next query!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="glass-panel rounded-3xl flex flex-col h-[740px] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white">
              Grounded Legal Q&amp;A Assistant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded in <span className="font-semibold text-slate-700 dark:text-slate-200">{documentTitle}</span> with direct clause citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToVoice && (
            <button
              onClick={onSwitchToVoice}
              className="text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold shadow-xs hover:scale-[1.02]"
              title="Talk with Gemini Live API (gemini-3.1-flash-live-preview)"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Voice Mode</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-bold">LIVE</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl glass-subtle hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested Questions Chips */}
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="px-4 py-2.5 glass-subtle border-b border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Inquiries:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isAnswering}
              className="text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-1 whitespace-nowrap transition-all shadow-2xs cursor-pointer shrink-0 disabled:opacity-50 font-medium hover:scale-[1.02]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-xs shadow-md"
                  : "glass-panel-elevated text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <div className={`flex items-center justify-between gap-4 text-[10px] pb-1 border-b ${
                msg.sender === "user" ? "text-indigo-200 border-white/20" : "text-slate-400 border-slate-200/60 dark:border-slate-800"
              }`}>
                <span className="font-bold uppercase tracking-wider">
                  {msg.sender === "user" ? "You" : "Legal Intelligence Engine"}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Evidence System (Item 5) */}
              {msg.sender === "assistant" && (msg.evidence || msg.source) && (
                <div className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <span>📄</span>
                      <span>Source:</span>
                    </span>
                    <button
                      onClick={() =>
                        setSelectedEvidence(
                          msg.evidence || {
                            clauseTitle: msg.clauseTitle || "Document Citation",
                            source: msg.source || "Document Body",
                            quote: msg.quote || (msg.citations && msg.citations[0]) || "",
                          }
                        )
                      }
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800"
                    >
                      <Eye className="w-3 h-3" />
                      <span>[View Source]</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    <span>{msg.evidence?.source || msg.source}</span>
                    {(msg.evidence?.clauseTitle || msg.clauseTitle) && (
                      <>
                        <span className="text-slate-400">•</span>
                        <span>{msg.evidence?.clauseTitle || msg.clauseTitle}</span>
                      </>
                    )}
                  </div>

                  {(msg.evidence?.quote || msg.quote) && (
                    <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 pl-2.5 border-l-2 border-indigo-500 italic line-clamp-3">
                      "{msg.evidence?.quote || msg.quote}"
                    </p>
                  )}
                </div>
              )}

              {/* Citations & Confidence Badge */}
              {msg.citations && msg.citations.length > 0 && !msg.evidence && !msg.source && (
                <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <Quote className="w-3.5 h-3.5 text-indigo-500" />
                      Document Grounding &amp; Direct Citations:
                    </span>
                    {msg.confidence && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {msg.confidence} Confidence
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 pl-2.5 border-l-2 border-indigo-500">
                    {msg.citations.map((cite, cIdx) => (
                      <li key={cIdx} className="leading-snug">
                        "{cite}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Google Search Grounding Sources (Gemini 3.5 Flash) */}
              {msg.googleSearchSources && msg.googleSearchSources.length > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Google Search Grounding (Statutes &amp; Precedents):
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-200/70 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      Live Search Grounded
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                      Verified Statutory &amp; Legal Authorities:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.googleSearchSources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-indigo-100 dark:border-indigo-900 hover:border-indigo-400 text-indigo-700 dark:text-indigo-300 transition-all text-[11px] font-medium group"
                        >
                          <span className="truncate pr-2">{src.title || src.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {msg.webSearchQueries && msg.webSearchQueries.length > 0 && (
                    <div className="pt-1 text-[10px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold">Search queries:</span>
                      {msg.webSearchQueries.map((sq, sqIdx) => (
                        <span
                          key={sqIdx}
                          className="px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-900/70 font-mono text-[10px]"
                        >
                          "{sq}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up suggestions */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-indigo-200/60 dark:border-indigo-900/60"
                      >
                        {fu} &rarr;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy message */}
              {msg.sender === "assistant" && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAnswering && (
          <div className="flex items-start gap-2">
            <div className="p-3.5 rounded-2xl glass-subtle text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 border border-slate-200/60 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
              Scanning document clauses for relevant citations and answers...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-200/60 dark:border-slate-800/80 glass-subtle"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask anything about this document (e.g. 'Can they cancel without notice?', 'What fees apply?')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isAnswering}
            className="w-full text-xs sm:text-sm pl-4 pr-12 py-3 glass-input rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAnswering}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs hover:scale-[1.04]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              useSearchGrounding
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs"
                : "bg-white/60 dark:bg-slate-800/60 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400"
            }`}
            title="When active, queries are grounded with Google Search & Gemini 3.5 Flash to verify against state & federal statutes"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Google Search Grounding (Statutes &amp; Precedents)</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                useSearchGrounding
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {useSearchGrounding ? "ON" : "OFF"}
            </span>
          </button>

          <div className="text-[10px] text-slate-400">
            Grounded in <span className="font-semibold text-slate-600 dark:text-slate-300">{documentTitle}</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center mt-2">
          Responses are generated to assist your personal review and prepare you for attorney discussions, not as formal legal advice.
        </div>
      </form>

      {/* Interactive Evidence Source Modal */}
      <AnimatePresence>
        {selectedEvidence && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedEvidence(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel-elevated rounded-3xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full p-6 text-slate-800 dark:text-slate-200 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base font-display text-slate-900 dark:text-white">
                      {selectedEvidence.clauseTitle || "Document Citation"}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
                      {selectedEvidence.source}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="text-xs font-bold px-3 py-1 rounded-xl glass-subtle hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Exact Excerpt from Uploaded Document:
                </span>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto whitespace-pre-wrap">
                  {selectedEvidence.quote || "No raw text quote found for this citation."}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-500">
                <span>Grounded specifically in {documentTitle}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedEvidence.quote);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                >
                  Copy Excerpt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
