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
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });
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

      {/* Floating Trigger Circular Button & Orbiting Antigravity Particles */}
      <div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => {
          setIsButtonHovered(false);
          setMagneticPos({ x: 0, y: 0 });
        }}
        onMouseMove={(e) => {
          if (isOpen) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * 0.22;
          const deltaY = (e.clientY - centerY) * 0.22;
          setMagneticPos({
            x: Math.max(-8, Math.min(8, deltaX)),
            y: Math.max(-8, Math.min(8, deltaY)),
          });
        }}
      >
        {/* Orbiting Antigravity Particles (Requirement 5) */}
        {!isOpen && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Particle 1 (Purple) */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: isButtonHovered ? 3.5 : 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-full h-full flex items-center justify-center"
            >
              <motion.span
                animate={{
                  x: isButtonHovered ? 46 : 38,
                  scale: isButtonHovered ? 1.25 : 1,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]"
              />
            </motion.div>

            {/* Particle 2 (Cyan / Sky) */}
            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: isButtonHovered ? 4.2 : 9.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-full h-full flex items-center justify-center"
            >
              <motion.span
                animate={{
                  y: isButtonHovered ? -46 : -38,
                  scale: isButtonHovered ? 1.3 : 1,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]"
              />
            </motion.div>

            {/* Particle 3 (Violet / Amber) */}
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: isButtonHovered ? 5.0 : 11,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-full h-full flex items-center justify-center"
            >
              <motion.span
                animate={{
                  x: isButtonHovered ? -44 : -36,
                  y: isButtonHovered ? 26 : 22,
                  scale: isButtonHovered ? 1.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(216,180,254,0.9)]"
              />
            </motion.div>
          </div>
        )}

        {/* Teaser pill / tooltip shown when closed */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute -top-12 right-0 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel-elevated shadow-xl border border-indigo-200/90 dark:border-indigo-800/80 text-xs font-bold text-indigo-950 dark:text-indigo-200 whitespace-nowrap cursor-pointer pointer-events-none select-none z-10"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            </motion.span>
            <span>Ask AI Assistant</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/90 text-indigo-600 dark:text-indigo-300 font-extrabold border border-indigo-300/80 dark:border-indigo-700/60 uppercase tracking-wide">
              Live
            </span>
          </motion.div>
        )}

        <motion.div
          animate={
            isOpen
              ? { y: 0, scale: 1, x: 0 }
              : {
                  x: magneticPos.x,
                  y: magneticPos.y,
                  scale: isButtonHovered ? 1.08 : 1,
                }
          }
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 25,
            mass: 0.5,
          }}
          whileTap={{ scale: 0.92 }}
          className="relative group cursor-pointer flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Outer Pulsing Sonar / Radar Ripple Ring 1 */}
          {!isOpen && (
            <motion.span
              className="absolute -inset-2 rounded-full bg-indigo-500/35 dark:bg-indigo-400/25 pointer-events-none"
              animate={{ scale: [1, 1.35, 1], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Outer Pulsing Sonar / Radar Ripple Ring 2 */}
          {!isOpen && (
            <motion.span
              className="absolute -inset-4 rounded-full bg-violet-500/25 dark:bg-violet-400/20 pointer-events-none"
              animate={{ scale: [1, 1.55, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          )}

          {/* Rotating Ambient Gradient Halo */}
          {!isOpen && (
            <motion.div
              className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 blur-[2px] pointer-events-none transition-opacity ${
                isButtonHovered ? "opacity-100 scale-105" : "opacity-80"
              }`}
              animate={{ rotate: 360 }}
              transition={{ duration: isButtonHovered ? 3.5 : 7, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Circle Action Button with Subtle Breathing Glow/Pulse and Enhanced Hover */}
          <button
            id="btn-floating-ai-assistant"
            aria-label={isOpen ? "Close Legal AI Assistant" : "Open Legal AI Assistant"}
            title={isOpen ? "Close Legal AI Assistant" : "Legal AI Assistant (Ask questions about this document)"}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center border-2 border-white/40 dark:border-white/20 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-all ${
              isOpen
                ? "shadow-2xl scale-100"
                : isButtonHovered
                ? "shadow-[0_0_36px_8px_rgba(99,102,241,0.85),0_0_54px_4px_rgba(79,70,229,0.60)]"
                : "assistant-pulse-glow"
            }`}
          >
            {/* Shimmer sweep effect */}
            {!isOpen && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 pointer-events-none"
                animate={{ x: ["-160%", "200%"] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
              />
            )}

            {/* Icon: transforms between animated Sparkles and Close X */}
            <motion.div
              key={isOpen ? "icon-close" : "icon-sparkles"}
              initial={{ rotate: isOpen ? -90 : 90, scale: 0.7, opacity: 0 }}
              animate={{
                rotate: isButtonHovered && !isOpen ? 15 : 0,
                scale: 1,
                opacity: 1,
              }}
              exit={{ rotate: isOpen ? 90 : -90, scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center justify-center"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <motion.div
                  animate={{
                    rotate: isButtonHovered ? [0, 20, 0] : [0, -10, 10, -5, 5, 0],
                    scale: isButtonHovered ? 1.15 : [1, 1.08, 1, 1.05, 1],
                  }}
                  transition={{
                    duration: isButtonHovered ? 1.8 : 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-sm" />
                </motion.div>
              )}
            </motion.div>

            {/* Live Online Badge on the circle */}
            {!isOpen && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs flex items-center justify-center pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
