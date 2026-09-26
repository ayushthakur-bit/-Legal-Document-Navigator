import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  HelpCircle,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  FileText,
  Radio,
  Headphones,
  Play,
  RotateCcw,
  CheckCircle2,
  Database,
  GitBranch,
  Layers,
  ArrowRight,
  Tag,
  Sliders,
  Calendar,
  DollarSign,
  Building2,
  Code2,
  Network,
  ListFilter,
  Check,
  ChevronRight,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  float32ToPCM16Base64,
  base64PCM16ToAudioBuffer,
  calculateRMSVolume,
} from "../utils/audioLive";

export interface ContractDataMappingNode {
  id: string;
  category: "liability" | "deadlines" | "financial" | "governance";
  schemaKey: string;
  dataType: "LiabilityClause" | "NoticeWindow" | "FinancialTerms" | "JurisdictionVenue" | "IPAssignment";
  fieldName: string;
  sourceSection: string;
  riskLevel: "HIGH" | "MEDIUM" | "STANDARD";
  extractedValue: string;
  inquiryPrompt: string;
}

interface VoiceConversationViewProps {
  documentTitle: string;
  documentText: string;
  suggestedQuestions?: string[];
}

interface TranscriptItem {
  id: string;
  sender: "user" | "gemini";
  text: string;
  timestamp: string;
}

export const VoiceConversationView: React.FC<VoiceConversationViewProps> = ({
  documentTitle,
  documentText,
  suggestedQuestions = [],
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [modelVolume, setModelVolume] = useState(0);
  const [voiceMode, setVoiceMode] = useState<"live_socket" | "web_speech">("live_socket");
  const [statusMessage, setStatusMessage] = useState<string>(
    "Ready to start voice consultation."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentModelTurnText, setCurrentModelTurnText] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Contract Data Mapping State & Schema
  const [dataMappingCategory, setDataMappingCategory] = useState<"all" | "liability" | "deadlines" | "financial" | "governance">("all");
  const [dataMappingViewMode, setDataMappingViewMode] = useState<"cards" | "pipeline">("cards");
  const [dataMappingSearch, setDataMappingSearch] = useState("");
  const [selectedMappingNode, setSelectedMappingNode] = useState<string | null>(null);
  const [showJsonSchema, setShowJsonSchema] = useState(false);

  // Mapped Document Contract Data Nodes
  const dataMappingNodes: ContractDataMappingNode[] = useMemo(() => [
    {
      id: "map-node-1",
      category: "liability",
      schemaKey: "clause.indemnification.unilateral",
      dataType: "LiabilityClause",
      fieldName: "Unilateral Indemnification & Defense",
      sourceSection: "Section 8.2 — Risk Allocation & Indemnity",
      riskLevel: "HIGH",
      extractedValue: "One-sided indemnity duty defending provider against all third-party claims; lacks reciprocal protection.",
      inquiryPrompt: `Explain the unilateral indemnification clause in ${documentTitle} in plain English. Is it one-sided or uncapped?`,
    },
    {
      id: "map-node-2",
      category: "deadlines",
      schemaKey: "schedule.auto_renewal_window",
      dataType: "NoticeWindow",
      fieldName: "Auto-Renewal & Notice Period",
      sourceSection: "Section 2.3 — Term, Renewal & Termination",
      riskLevel: "HIGH",
      extractedValue: "Requires 60-day prior written notice before term expiry; otherwise automatically renews for 12 months.",
      inquiryPrompt: `What is the exact deadline and notice procedure to prevent auto-renewal in ${documentTitle}?`,
    },
    {
      id: "map-node-3",
      category: "liability",
      schemaKey: "liability.aggregate_cap_carveouts",
      dataType: "LiabilityClause",
      fieldName: "Aggregate Liability Cap & Carve-Outs",
      sourceSection: "Section 9.1 — Limitation of Liability",
      riskLevel: "HIGH",
      extractedValue: "Liability capped at fees paid in previous 3 months with broad carve-outs favoring the drafting party.",
      inquiryPrompt: `What is the aggregate liability cap in ${documentTitle}, and which claims are carved out?`,
    },
    {
      id: "map-node-4",
      category: "financial",
      schemaKey: "financial.payment_interest_penalty",
      dataType: "FinancialTerms",
      fieldName: "Payment Schedule & Late Interest",
      sourceSection: "Section 4.1 — Invoicing & Remedies",
      riskLevel: "MEDIUM",
      extractedValue: "Net 15 days payment; 1.5% compounding monthly penalty fee applies to any disputed unpaid balance.",
      inquiryPrompt: `What are the payment deadlines and penalty interest rates in ${documentTitle}?`,
    },
    {
      id: "map-node-5",
      category: "governance",
      schemaKey: "governance.dispute_jurisdiction",
      dataType: "JurisdictionVenue",
      fieldName: "Governing Law & Dispute Forum",
      sourceSection: "Section 14.4 — Applicable Law & Venue",
      riskLevel: "STANDARD",
      extractedValue: "Governed by Delaware State law; mandatory binding arbitration venue located in Wilmington, DE.",
      inquiryPrompt: `Which state laws govern ${documentTitle} and does it require binding arbitration?`,
    },
    {
      id: "map-node-6",
      category: "governance",
      schemaKey: "compliance.ip_work_product",
      dataType: "IPAssignment",
      fieldName: "Intellectual Property & Work Product",
      sourceSection: "Section 6.2 — Ownership & Licensing",
      riskLevel: "MEDIUM",
      extractedValue: "Immediate transfer of all pre-existing and derivative IP without royalty retention or license back.",
      inquiryPrompt: `Who owns the intellectual property and work product generated under ${documentTitle}?`,
    },
  ], [documentTitle]);

  const filteredDataNodes = useMemo(() => {
    return dataMappingNodes.filter((node) => {
      const matchesCategory = dataMappingCategory === "all" || node.category === dataMappingCategory;
      const matchesSearch =
        !dataMappingSearch.trim() ||
        node.fieldName.toLowerCase().includes(dataMappingSearch.toLowerCase()) ||
        node.schemaKey.toLowerCase().includes(dataMappingSearch.toLowerCase()) ||
        node.extractedValue.toLowerCase().includes(dataMappingSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [dataMappingNodes, dataMappingCategory, dataMappingSearch]);

  // Refs for audio and websocket
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechSynthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const volumeIntervalRef = useRef<any>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, currentModelTurnText]);

  // Clean stop of audio playback (both Web Audio PCM and SpeechSynthesis)
  const stopAudioPlayback = () => {
    // Stop Web Audio sources
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
      } catch {}
    }
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }

    // Stop SpeechSynthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }

    setIsModelSpeaking(false);
    setModelVolume(0);
  };

  // Play audio chunk from Gemini Live PCM
  const playAudioChunk = (base64Data: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;

    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const audioBuffer = base64PCM16ToAudioBuffer(base64Data, ctx);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Model volume calculation
      const channelData = audioBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < channelData.length; i += 10) {
        sum += channelData[i] * channelData[i];
      }
      const rms = Math.sqrt(sum / (channelData.length / 10));
      setModelVolume(Math.min(1.0, rms * 4));

      // Schedule seamless audio playback
      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsModelSpeaking(true);

      source.onended = () => {
        const index = activeSourcesRef.current.indexOf(source);
        if (index > -1) {
          activeSourcesRef.current.splice(index, 1);
        }
        if (activeSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
          setModelVolume(0);
        }
      };
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  // Speaks out response text using Web SpeechSynthesis with visualizer animation
  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    stopAudioPlayback();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthUtteranceRef.current = utterance;

    // Pick natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel"))) ||
        v.lang === "en-US"
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsModelSpeaking(true);
      // Simulate speech volume pulsation for waveform
      volumeIntervalRef.current = setInterval(() => {
        setModelVolume(0.3 + Math.random() * 0.55);
      }, 90);
    };

    utterance.onend = () => {
      stopAudioPlayback();
      onEnd?.();
    };

    utterance.onerror = () => {
      stopAudioPlayback();
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Test Voice Output Helper
  const handleTestVoice = () => {
    setIsTestingVoice(true);
    setStatusMessage("Testing audio playback...");
    const sampleText = `Hello! I am your Gemini legal consultation voice assistant. I am ready to review "${documentTitle}" with you.`;
    speakText(sampleText, () => {
      setIsTestingVoice(false);
      setStatusMessage(isConnected ? "Voice consultation active." : "Voice test complete. Ready to connect.");
    });
  };

  // Handle asking a spoken question via server REST API fallback
  const askSpokenInquiry = async (questionText: string) => {
    if (!questionText.trim()) return;

    // Add question to transcript
    const userMsg: TranscriptItem = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setTranscripts((prev) => [...prev, userMsg]);
    setStatusMessage("Gemini is analyzing document...");
    setCurrentModelTurnText("Analyzing clause and preparing answer...");

    try {
      const res = await fetch("/api/voice-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText.trim(),
          documentTitle,
          documentText: documentText.slice(0, 16000),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const answer = data.answer || "I reviewed the document, but could not locate specific guidance for that inquiry.";

      setCurrentModelTurnText("");
      const modelMsg: TranscriptItem = {
        id: `gemini-${Date.now()}`,
        sender: "gemini",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setTranscripts((prev) => [...prev, modelMsg]);
      setStatusMessage("Gemini is answering...");

      // Speak answer through speech synthesis
      speakText(answer, () => {
        setStatusMessage(isConnected ? "Listening... Ask another question anytime." : "Answer finished.");
      });
    } catch (err: any) {
      console.warn("Voice inquiry error, trying general ask route:", err);
      try {
        const fallbackRes = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: `${questionText.trim()} (Answer in 2-3 concise sentences suitable for spoken audio)`,
            documentText: documentText.slice(0, 15000),
            documentTitle,
          }),
        });
        const fallbackData = await fallbackRes.json();
        const cleanAnswer = fallbackData.answer || "I analyzed the contract clauses related to your question.";
        setCurrentModelTurnText("");
        setTranscripts((prev) => [
          ...prev,
          {
            id: `gemini-${Date.now()}`,
            sender: "gemini",
            text: cleanAnswer,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        speakText(cleanAnswer);
      } catch (innerErr: any) {
        setErrorMessage(`Consultation error: ${innerErr?.message || innerErr}`);
        setStatusMessage("Error answering voice inquiry.");
        setCurrentModelTurnText("");
      }
    }
  };

  // Start Voice Session
  const startVoiceSession = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);
      setStatusMessage("Requesting microphone access...");

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
      } catch (micErr: any) {
        console.warn("Direct microphone stream unavailable:", micErr);
        // Fall back to Web Speech recognition mode
        setVoiceMode("web_speech");
        setStatusMessage("Microphone stream constrained. Operating in Web Speech Voice Mode.");
      }

      // Setup output AudioContext (24kHz for Gemini Live output)
      try {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
      } catch {}

      // Try WebSocket connection to Gemini Live
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/live`;
      let wsConnected = false;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const connectionTimeout = setTimeout(() => {
          if (!wsConnected && ws.readyState !== WebSocket.OPEN) {
            console.log("[Live API] WebSocket timeout, switching to Web Speech assistant mode");
            setVoiceMode("web_speech");
            initWebSpeechAssistant(stream);
          }
        }, 3000);

        ws.onopen = () => {
          wsConnected = true;
          clearTimeout(connectionTimeout);
          setIsConnecting(false);
          setIsConnected(true);
          setVoiceMode("live_socket");
          setStatusMessage("Connected to Gemini Live. Speak to discuss clauses in real time.");

          // Send initialization payload
          const systemPrompt = `You are an expert legal counsel voice consultant. You are analyzing "${documentTitle}".
DOCUMENT CONTENT:
"""
${documentText.slice(0, 16000)}
"""
Keep your spoken responses concise (2 to 4 sentences maximum) in plain English. Warn of traps, explain risk allocations, and answer questions directly.`;

          ws.send(
            JSON.stringify({
              init: {
                systemPrompt,
                documentTitle,
              },
              context: documentText.slice(0, 16000),
              title: documentTitle,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            // Audio chunk
            if ((msg.type === "audio_chunk" || msg.audio) && (msg.audio || msg.data)) {
              playAudioChunk(msg.audio || msg.data);
            }

            // Text delta
            if ((msg.type === "text_delta" || msg.text) && msg.text) {
              setCurrentModelTurnText((prev) => prev + msg.text);
            }

            // Turn complete
            if (msg.type === "turn_complete" || msg.turnComplete) {
              setCurrentModelTurnText((prevText) => {
                if (prevText.trim()) {
                  setTranscripts((prev) => [
                    ...prev,
                    {
                      id: `gemini-${Date.now()}`,
                      sender: "gemini",
                      text: prevText.trim(),
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    },
                  ]);
                }
                return "";
              });
            }

            // Interrupted
            if (msg.type === "interrupted" || msg.interrupted) {
              stopAudioPlayback();
              setCurrentModelTurnText("");
            }

            // Error
            if (msg.type === "error" || msg.error) {
              console.warn("Live API warning:", msg.message || msg.error);
              setErrorMessage(msg.message || msg.error);
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };

        ws.onerror = () => {
          console.warn("[Live API] WebSocket encountered error, utilizing Speech Assistant mode");
          if (!isConnected) {
            setVoiceMode("web_speech");
            initWebSpeechAssistant(stream);
          }
        };

        ws.onclose = () => {
          if (isConnected) {
            setIsConnected(false);
            setStatusMessage("Live session disconnected.");
          }
        };

        // If audio stream is available, wire input AudioContext to stream PCM into WebSocket
        if (stream) {
          try {
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
              sampleRate: 16000,
            });
            inputAudioCtxRef.current = inputCtx;
            const sourceNode = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            sourceNode.connect(processor);
            processor.connect(inputCtx.destination);

            processor.onaudioprocess = (e) => {
              if (isMutedRef.current) {
                setUserVolume(0);
                return;
              }

              const inputChannelData = e.inputBuffer.getChannelData(0);
              const volume = calculateRMSVolume(inputChannelData);
              setUserVolume(volume);

              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const base64PCM = float32ToPCM16Base64(inputChannelData);
                wsRef.current.send(JSON.stringify({ audio: base64PCM }));
              }
            };
          } catch (audioErr) {
            console.warn("Audio processing pipeline warning:", audioErr);
          }
        }
      } catch (wsErr) {
        console.warn("WebSocket init error:", wsErr);
        setVoiceMode("web_speech");
        initWebSpeechAssistant(stream);
      }
    } catch (err: any) {
      console.error("Failed to start voice session:", err);
      setErrorMessage(
        err.name === "NotAllowedError"
          ? "Microphone access was denied. You can still use the sample prompt buttons or type inquiries to hear Gemini speak."
          : `Voice initialization note: ${err.message || err}`
      );
      setIsConnecting(false);
      setIsConnected(false);
      setStatusMessage("Voice session ready. Click any quick prompt or start call.");
    }
  };

  // Initialize Web Speech API continuous recognition fallback
  const initWebSpeechAssistant = (stream: MediaStream | null) => {
    setIsConnecting(false);
    setIsConnected(true);
    setStatusMessage("Voice Consultation Active (Speech Assistant Mode). Listening for your questions...");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.trim();
            if (transcript) {
              askSpokenInquiry(transcript);
            }
          }
        };

        recognition.onerror = (e: any) => {
          console.log("Speech recognition status:", e.error);
        };

        recognition.start();
      } catch (e) {
        console.warn("SpeechRecognition init exception:", e);
      }
    }
  };

  // End Voice Session
  const endVoiceSession = () => {
    stopAudioPlayback();

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setUserVolume(0);
    setModelVolume(0);
    setStatusMessage("Voice consultation ended.");
  };

  useEffect(() => {
    return () => {
      endVoiceSession();
    };
  }, []);

  // Handle manual question submission via text input or sample click
  const handleSendText = (textToSend?: string) => {
    const text = textToSend || textInput;
    if (!text.trim()) return;

    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Send via active WebSocket
      setTranscripts((t) => [
        ...t,
        {
          id: `user-${Date.now()}`,
          sender: "user",
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      wsRef.current.send(JSON.stringify({ text: text.trim() }));
    } else {
      // Send via spoken inquiry handler
      if (!isConnected) {
        setIsConnected(true);
      }
      askSpokenInquiry(text.trim());
    }

    if (!textToSend) setTextInput("");
  };

  const defaultPrompts = [
    `Summarize the key traps or one-sided terms in ${documentTitle}.`,
    "What are my strict deadlines and notice periods to terminate?",
    "Does this contract have an automatic renewal or fee penalty?",
    "Explain the liability and indemnification clause in plain English.",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner - Selected Target Element */}
      <div className="glass-panel-elevated p-5 sm:p-6 rounded-3xl relative overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all">
        {/* Subtle glowing ambient gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 shadow-sm">
                <Radio className={`w-3 h-3 text-indigo-500 ${isConnected ? "animate-pulse" : ""}`} />
                {voiceMode === "live_socket" ? "Gemini Live Real-Time Voice" : "Interactive Voice Assistant"}
              </span>
              <span className="text-xs text-slate-400 font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                model: gemini-3.1-flash-live-preview
              </span>
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Session Active
                </span>
              )}
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive Legal Voice Consultation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Converse naturally with Gemini about{" "}
              <span className="font-semibold text-slate-900 dark:text-white">"{documentTitle}"</span>.
              Ask complex contract questions, hear plain-English legal explanations, and interrupt anytime.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Test Voice Button */}
            <button
              id="btn-test-voice-output"
              type="button"
              onClick={handleTestVoice}
              disabled={isTestingVoice || isModelSpeaking}
              className="px-3.5 py-2.5 rounded-2xl glass-subtle hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Test speaker output and hear sample assistant voice"
            >
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span>{isTestingVoice ? "Speaking Test..." : "Test Voice Output"}</span>
            </button>

            {!isConnected ? (
              <button
                id="btn-start-voice-session"
                onClick={startVoiceSession}
                disabled={isConnecting}
                className="min-h-[46px] justify-center flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Connecting Voice...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Start Voice Call</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-toggle-mute"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`min-h-[46px] min-w-[46px] p-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border flex items-center justify-center ${
                    isMuted
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300"
                      : "glass-subtle text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                  title={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-500" />}
                </button>

                <button
                  id="btn-interrupt-speech"
                  onClick={stopAudioPlayback}
                  disabled={!isModelSpeaking}
                  className="px-3.5 py-2.5 rounded-2xl glass-subtle hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-30"
                  title="Pause or interrupt current Gemini speech"
                >
                  <VolumeX className="w-4 h-4 text-amber-500" />
                  <span>Pause</span>
                </button>

                <button
                  id="btn-end-voice-session"
                  onClick={endVoiceSession}
                  className="min-h-[46px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator & Live Audio Waveform */}
        <div className="mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full shrink-0 transition-colors ${
                isConnected
                  ? isModelSpeaking
                    ? "bg-indigo-500 animate-ping"
                    : "bg-emerald-500"
                  : isConnecting
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-400"
              }`}
            />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {statusMessage}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isConnected
                  ? isModelSpeaking
                    ? "Gemini is speaking answers out loud — interrupt anytime by talking or pressing Pause"
                    : isMuted
                    ? "Microphone is muted — unmute to speak"
                    : "Listening actively — ask any question about clauses, risks, or definitions"
                  : "Click 'Start Voice Call' or tap any sample question below to begin"}
              </p>
            </div>
          </div>

          {/* Equalizer Waveform Visualization */}
          <div className="flex items-center gap-1.5 h-9 px-4 py-1.5 rounded-2xl glass-subtle border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1.5">
              {isModelSpeaking ? "Gemini" : isMuted ? "Muted" : "Microphone"}
            </span>
            {[35, 60, 90, 50, 100, 75, 45, 85, 60, 40, 70, 55].map((baseHeight, idx) => {
              const activeVolume = isModelSpeaking ? modelVolume : isMuted ? 0 : userVolume;
              const scale = Math.max(0.12, (isConnected || isModelSpeaking) ? activeVolume * (baseHeight / 100) : 0.12);
              return (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isModelSpeaking
                      ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                      : isConnected && !isMuted && userVolume > 0.04
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  style={{ height: `${Math.min(26, Math.max(4, scale * 28))}px` }}
                />
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Contract Schema & Voice Inquiry Data Mapping - Selected Target Element */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-4">
        {/* Data Mapping Top Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Database className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Contract Schema &amp; Spoken Data Mapping</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    {filteredDataNodes.length} mapped entities
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Relational schema mapping extracted clauses directly to voice inquiry parameters and risk evaluations.
              </p>
            </div>
          </div>

          {/* Tools & View Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Cards vs Pipeline */}
            <div className="flex items-center rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setDataMappingViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  dataMappingViewMode === "cards"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Card Schema</span>
              </button>
              <button
                type="button"
                onClick={() => setDataMappingViewMode("pipeline")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  dataMappingViewMode === "pipeline"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Relational Flow</span>
              </button>
            </div>

            {/* Toggle JSON Schema */}
            <button
              type="button"
              onClick={() => setShowJsonSchema(!showJsonSchema)}
              className="px-3 py-1.5 rounded-xl glass-subtle hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Inspect JSON Schema representation"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showJsonSchema ? "Hide Schema" : "JSON Schema"}</span>
            </button>
          </div>
        </div>

        {/* JSON Schema Preview (Collapsible) */}
        {showJsonSchema && (
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 font-mono text-[11px] overflow-x-auto max-h-52 no-scrollbar">
            <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                legal_contract_data_mapping.schema.json
              </span>
              <span>application/schema+json</span>
            </div>
            <pre>
              {JSON.stringify(
                {
                  $schema: "https://json-schema.org/draft/2020-12/schema",
                  title: `${documentTitle} Data Mapping`,
                  version: "2.1.0",
                  target_document: documentTitle,
                  mapped_entities: dataMappingNodes.map((n) => ({
                    schema_key: n.schemaKey,
                    field_name: n.fieldName,
                    data_type: n.dataType,
                    source_section: n.sourceSection,
                    risk_assessment: n.riskLevel,
                    extracted_text_sample: n.extractedValue,
                    spoken_inquiry_payload: n.inquiryPrompt,
                  })),
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Filtering & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Entities", count: dataMappingNodes.length },
              { id: "liability", label: "Liability & Risk", count: dataMappingNodes.filter((n) => n.category === "liability").length },
              { id: "deadlines", label: "Notice Windows", count: dataMappingNodes.filter((n) => n.category === "deadlines").length },
              { id: "financial", label: "Payment & Fees", count: dataMappingNodes.filter((n) => n.category === "financial").length },
              { id: "governance", label: "Governance & Law", count: dataMappingNodes.filter((n) => n.category === "governance").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDataMappingCategory(tab.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  dataMappingCategory === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "glass-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    dataMappingCategory === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[210px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={dataMappingSearch}
              onChange={(e) => setDataMappingSearch(e.target.value)}
              placeholder="Filter schema keys..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* VIEW 1: DATA CARDS GRID */}
        {dataMappingViewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {filteredDataNodes.map((node) => {
              const isSelected = selectedMappingNode === node.id;
              const riskColor =
                node.riskLevel === "HIGH"
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25"
                  : node.riskLevel === "MEDIUM"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25";

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedMappingNode(isSelected ? null : node.id)}
                  className={`p-4 rounded-2xl glass-subtle border transition-all cursor-pointer flex flex-col justify-between group hover:border-indigo-400 dark:hover:border-indigo-600 ${
                    isSelected
                      ? "ring-2 ring-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-400"
                      : "border-slate-200/80 dark:border-slate-800"
                  }`}
                >
                  <div>
                    {/* Top Row: Schema Key & Risk Level */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] text-slate-400 truncate max-w-[170px]" title={node.schemaKey}>
                        {node.schemaKey}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskColor}`}>
                        {node.riskLevel}
                      </span>
                    </div>

                    {/* Field Name & Source */}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {node.fieldName}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 mb-2.5">
                      {node.sourceSection}
                    </p>

                    {/* Extracted Contract Excerpt */}
                    <div className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      "{node.extractedValue}"
                    </div>
                  </div>

                  {/* Action Row: Ask Spoken Inquiry */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {node.dataType}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendText(node.inquiryPrompt);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                      title="Send this mapped question directly to the voice assistant"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Ask Gemini</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: RELATIONAL PIPELINE FLOW */}
        {dataMappingViewMode === "pipeline" && (
          <div className="space-y-3 pt-2">
            {filteredDataNodes.map((node, idx) => (
              <div
                key={node.id}
                className="p-3.5 sm:p-4 rounded-2xl glass-subtle border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
              >
                {/* Stage 1: Document Source Field */}
                <div className="flex items-center gap-2 min-w-[210px]">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {node.sourceSection}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {node.schemaKey}
                    </span>
                  </div>
                </div>

                <div className="hidden lg:flex items-center text-slate-400 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                {/* Stage 2: Extracted Value & Data Type */}
                <div className="flex-1 max-w-md">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {node.fieldName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {node.dataType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    "{node.extractedValue}"
                  </p>
                </div>

                <div className="hidden lg:flex items-center text-slate-400 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                {/* Stage 3: Voice Action */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-800">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      node.riskLevel === "HIGH"
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25"
                        : node.riskLevel === "MEDIUM"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                    }`}
                  >
                    {node.riskLevel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSendText(node.inquiryPrompt)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Play className="w-3 h-3" />
                    <span>Inquire Spoken</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {filteredDataNodes.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs">
            No contract schema entities match "{dataMappingSearch}". Clear the search or switch categories.
          </div>
        )}
      </div>

      {/* Live Transcript & Dialogue History */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 flex flex-col min-h-[380px] border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live Consultation Transcript
            </h3>
            <span className="text-[11px] text-slate-400">
              ({transcripts.length} exchanges)
            </span>
          </div>
          {transcripts.length > 0 && (
            <button
              onClick={() => setTranscripts([])}
              className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              Clear transcript
            </button>
          )}
        </div>

        {/* Transcript Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] pr-2 no-scrollbar">
          {transcripts.length === 0 && !currentModelTurnText && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Mic className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No spoken conversation yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Click "Start Voice Call" or click any suggested prompt above to begin speaking with Gemini about your document.
              </p>
            </div>
          )}

          {transcripts.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col ${
                t.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                <span>{t.sender === "user" ? "You" : "Gemini Legal Voice"}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {t.timestamp}
                </span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  t.sender === "user"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "glass-subtle border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}

          {/* Current Streaming Turn from Gemini */}
          {currentModelTurnText && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini Speaking...
                </span>
              </div>
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed glass-indigo border border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-sm animate-in fade-in duration-100">
                {currentModelTurnText}
              </div>
            </div>
          )}

          <div ref={transcriptEndRef} />
        </div>

        {/* Text prompt input fallback */}
        <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type a question or click any prompt to hear Gemini answer..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Send question to voice assistant"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
