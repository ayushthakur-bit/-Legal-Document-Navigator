import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
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
} from "lucide-react";
import { ChatMessage } from "../types";

interface GroundedLegalChatViewProps {
  documentTitle: string;
  documentText: string;
  suggestedQuestions: string[];
  onAskQuestion: (q: string) => Promise<any>;
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
      text: `Hello! I am your grounded legal document assistant. I have indexed "${documentTitle}". You can ask any question about fee triggers, termination rights, notice deadlines, liability restrictions, or landlord entry covenants. Every answer is grounded directly in the document text.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      const result = await onAskQuestion(query.trim());

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: result.answer,
        citations: result.citations,
        confidence: result.confidence,
        suggestedFollowUps: result.suggestedFollowUps,
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

              {/* Citations & Confidence Badge */}
              {msg.citations && msg.citations.length > 0 && (
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
        <div className="text-[10px] text-slate-400 text-center mt-2">
          Responses are generated to assist your personal review and prepare you for attorney discussions, not as formal legal advice.
        </div>
      </form>
    </div>
  );
};
