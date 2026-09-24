import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  ShieldAlert,
  FileText,
  ChevronDown,
  CornerDownLeft,
  Bot,
  User,
  ExternalLink,
} from "lucide-react";
import { ChatMessage } from "../types";

interface FloatingAIAssistantProps {
  documentTitle: string;
  documentText: string;
  onNavigateToFullChat?: () => void;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  documentTitle,
  documentText,
  onNavigateToFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: `Hello! I'm your Legal AI Assistant for "${documentTitle}". Ask me any question, such as hidden risks, cancellation notice, or clauses you want translated to plain English.`,
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    "What are my biggest risks?",
    "What can I negotiate?",
    "What can hurt me?",
    "What is the notice period to cancel?",
  ];

  const handleSend = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/legal/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          documentText,
          documentTitle,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: data.answer || "I reviewed the document regarding your question.",
        citations: data.citations,
        confidence: data.confidence,
        suggestedFollowUps: data.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "assistant",
        text: "I encountered an issue analyzing the document text. Please try asking in different words or view the full Grounded Q&A tab.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="w-80 sm:w-96 h-[510px] glass-panel-elevated rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 flex flex-col overflow-hidden mb-3"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between bg-white/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Legal AI Assistant
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    Grounded in {documentTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {onNavigateToFullChat && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateToFullChat();
                    }}
                    title="Open Full Screen Chat"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2.5 border-b border-slate-200/40 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-[11px] px-2.5 py-1 rounded-full glass-subtle hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Thread */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      m.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-xs shadow-xs"
                        : "glass-subtle text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    {m.text}

                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold block mb-0.5">Direct Citation:</span>
                        <div className="italic bg-white/40 dark:bg-black/20 p-1.5 rounded text-[10px]">
                          "{m.citations[0]}"
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{m.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 p-2">
                  <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="font-medium text-[11px]">Analyzing document clauses...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask anything about this document..."
                disabled={isLoading}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {/* Teaser pill */}
          <div className="absolute -top-10 right-0 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel-elevated shadow-lg border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold text-indigo-900 dark:text-indigo-200 whitespace-nowrap animate-bounce">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Ask about this document: "What can hurt me?"</span>
          </div>

          <button
            id="btn-floating-ai-assistant"
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white font-semibold text-sm shadow-xl hover:shadow-indigo-500/25 transition-all cursor-pointer border border-white/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
