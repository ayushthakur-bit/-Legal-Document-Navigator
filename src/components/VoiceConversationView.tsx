import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import {
  float32ToPCM16Base64,
  base64PCM16ToAudioBuffer,
  calculateRMSVolume,
} from "../utils/audioLive";

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
  const [statusMessage, setStatusMessage] = useState<string>(
    "Ready to start live voice consultation."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentModelTurnText, setCurrentModelTurnText] = useState("");
  const [textInput, setTextInput] = useState("");

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

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts, currentModelTurnText]);

  const stopAudioPlayback = () => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
      } catch {}
    }
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
    setModelVolume(0);
  };

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

      // Connect source to gain and destination
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Simple model volume calculation
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

  const startVoiceSession = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);
      setStatusMessage("Requesting microphone access...");

      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup output AudioContext (24kHz for Gemini Live output)
      outputAudioCtxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;

      // 3. Setup input AudioContext (16kHz for Gemini input)
      const inputCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;

      setStatusMessage("Connecting to Gemini Live WebSocket proxy...");

      // 4. Connect to backend websocket proxy
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/live-audio`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        setStatusMessage("Live session active. Initializing context...");

        // Send initialization payload with full document grounding
        const systemPrompt = `You are a legal document consultation partner. You are analyzing the document titled "${documentTitle}".
DOCUMENT CONTENT:
"""
${documentText.slice(0, 18000)}
"""
Explain clauses clearly in everyday conversational English, warn of traps, and answer verbally. Keep your spoken responses concise (2 to 4 sentences maximum) so the user can easily converse back. Always ground explanations strictly in the text.`;

        ws.send(
          JSON.stringify({
            init: {
              systemPrompt,
              documentTitle,
            },
          })
        );

        setStatusMessage("Connected. Say something like 'What are the main risks?'");
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "text_delta" && msg.text) {
            setCurrentModelTurnText((prev) => prev + msg.text);
          } else if (msg.type === "turn_complete") {
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
          } else if (msg.type === "interrupted") {
            stopAudioPlayback();
            setCurrentModelTurnText("");
          } else if (msg.type === "audio_chunk" && msg.audio) {
            playAudioChunk(msg.audio);
          } else if (msg.type === "error") {
            setErrorMessage(msg.message || "Live API error occurred");
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setErrorMessage("Connection error with Live Audio backend.");
        endVoiceSession();
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setStatusMessage("Live session disconnected.");
      };

      // 5. Audio recording pipeline using ScriptProcessorNode
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
    } catch (err: any) {
      console.error("Failed to start voice session:", err);
      setErrorMessage(
        err.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow microphone permissions in your browser to talk."
          : `Failed to initialize voice session: ${err.message || err}`
      );
      setIsConnecting(false);
      setIsConnected(false);
      setStatusMessage("Failed to connect.");
    }
  };

  const endVoiceSession = () => {
    stopAudioPlayback();

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
    setStatusMessage("Voice conversation ended.");
  };

  useEffect(() => {
    return () => {
      endVoiceSession();
    };
  }, []);

  const handleSendText = (textToSend?: string) => {
    const text = textToSend || textInput;
    if (!text.trim()) return;

    if (!isConnected || !wsRef.current) {
      setErrorMessage("Please start the live voice session first before sending prompts.");
      return;
    }

    setTranscripts((t) => [
      ...t,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    wsRef.current.send(JSON.stringify({ text: text.trim() }));
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
      {/* Header Banner */}
      <div className="glass-panel-elevated p-6 rounded-3xl relative overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Live API Real-Time Voice
              </span>
              <span className="text-xs text-slate-400 font-mono">
                model: gemini-3.1-flash-live-preview
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Interactive Legal Voice Consultation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Talk directly with Gemini about <span className="font-semibold text-slate-900 dark:text-white">"{documentTitle}"</span>.
              Ask questions naturally, interrupt whenever you want, and hear plain-English answers streamed in real time.
            </p>
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {!isConnected ? (
              <button
                id="btn-start-voice-session"
                onClick={startVoiceSession}
                disabled={isConnecting}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
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
                  className={`p-3 rounded-2xl font-semibold text-sm transition-all cursor-pointer border ${
                    isMuted
                      ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300"
                      : "glass-subtle text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                  title={isMuted ? "Unmute microphone" : "Mute microphone"}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-500" />}
                </button>

                <button
                  id="btn-end-voice-session"
                  onClick={endVoiceSession}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicator & Waveform Stage */}
        <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full transition-colors ${
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
              <p className="text-xs font-bold text-slate-900 dark:text-white">{statusMessage}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isConnected
                  ? isModelSpeaking
                    ? "Gemini is speaking (24kHz audio) — speak anytime to interrupt"
                    : isMuted
                    ? "Microphone muted"
                    : "Listening for your voice (16kHz PCM)..."
                  : "Microphone currently idle"}
              </p>
            </div>
          </div>

          {/* Audio Waveform Visualizer */}
          <div className="flex items-center gap-1.5 h-8 px-4 py-1.5 rounded-xl glass-subtle border border-slate-200/80 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              {isModelSpeaking ? "Gemini" : "Mic"}
            </span>
            {[40, 70, 100, 60, 85, 50, 95, 65, 45, 80].map((baseHeight, idx) => {
              const activeVolume = isModelSpeaking ? modelVolume : isMuted ? 0 : userVolume;
              const scale = Math.max(0.15, isConnected ? activeVolume * (baseHeight / 100) : 0.15);
              return (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-75 ${
                    isModelSpeaking
                      ? "bg-indigo-500"
                      : isConnected && !isMuted && userVolume > 0.05
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  style={{ height: `${Math.min(24, Math.max(4, scale * 26))}px` }}
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

      {/* Suggested Spoken Prompts */}
      <div className="glass-panel p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick questions to ask out loud or click to send:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {defaultPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendText(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl glass-subtle hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition-all cursor-pointer hover:scale-[1.02]"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Live Transcript & Dialogue History */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col min-h-[380px] border border-slate-200/80 dark:border-slate-800">
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
                Click "Start Voice Call" above to begin a natural spoken conversation with Gemini about your document.
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
              placeholder={
                isConnected
                  ? "Type a question or speak into your microphone..."
                  : "Start voice call to converse..."
              }
              disabled={!isConnected}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isConnected || !textInput.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
              title="Send text prompt to Live session"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
