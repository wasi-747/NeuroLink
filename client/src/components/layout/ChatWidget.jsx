import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  Volume2,
  VolumeX,
  Wind,
  ShieldAlert,
  Brain,
  MessageSquare,
  RefreshCw,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import CrisisModal from "../common/CrisisModal";

const SUGGESTION_CHIPS = [
  "I'm feeling anxious about exams 📚",
  "Guide me through a 2-minute reset 🧘",
  "How does sleep affect my mood? 🌙",
  "Tips to boost my study focus ⚡",
  "I feel overwhelmed and lonely 🌧️",
];

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale");
  const messagesEndRef = useRef(null);

  const initialGreeting = `Hi ${
    user?.name ? user.name.split(" ")[0] : "friend"
  }! I'm Aria, your AI wellness companion. I'm here to listen, support, and help you find calm. Remember, I'm an AI companion, not a licensed medical therapist. What's on your mind today? 🌿`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBreathingMode]);

  useEffect(() => {
    const handleOpenEvent = (e) => {
      setIsOpen(true);
      if (messages.length === 0) {
        setMessages([
          {
            id: "init",
            role: "assistant",
            content: initialGreeting,
            time: "Just now",
          },
        ]);
      }
      if (e.detail?.prompt) {
        setInput(e.detail.prompt);
      }
    };
    window.addEventListener("open-aria-chat", handleOpenEvent);
    return () => window.removeEventListener("open-aria-chat", handleOpenEvent);
  }, [messages.length, user?.name]);

  // Breathing Box Timer
  useEffect(() => {
    let timer;
    if (isBreathingMode) {
      const phases = ["Inhale", "Hold", "Exhale", "Rest"];
      let step = 0;
      timer = setInterval(() => {
        step = (step + 1) % phases.length;
        setBreathPhase(phases[step]);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isBreathingMode]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          id: "init",
          role: "assistant",
          content: initialGreeting,
          time: "Just now",
        },
      ]);
    }
  };

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ml/chat", {
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        user_context: {
          name: user?.name,
        },
      });

      const ariaReply =
        res.data?.reply ||
        "I'm right here with you. Take a slow, steady breath. How can we make the next hour a bit gentler for you?";

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: ariaReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages([...newMessages, assistantMsg]);

      if (res.data?.isCrisis) {
        setIsCrisisModalOpen(true);
      }
    } catch (error) {
      // Local fallback
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I hear you. Academic and life pressures can feel so intense. Remember that you don't have to carry it all at once. Would you like to do a quick 2-minute breathing reset together?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...newMessages, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (id, text) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported by your browser");
      return;
    }

    if (isSpeaking && activeSpeechId === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechId(null);
    };

    setActiveSpeechId(id);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: initialGreeting,
        time: "Just now",
      },
    ]);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Floating Orb Bubble */}
        {!isOpen && (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand/30 animate-ping opacity-75" />
            <motion.button
              onClick={handleToggle}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="relative w-15 h-15 rounded-3xl bg-linear-to-br from-[#7c3aed] via-[#6d28d9] to-[#3b0764] shadow-xl text-white flex items-center justify-center cursor-pointer border-2 border-white/30"
            >
              <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
            </motion.button>
            <div className="absolute bottom-18 right-0 whitespace-nowrap bg-ink text-white text-xs font-black rounded-2xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-cream-dark">
              Talk to Aria ✨
            </div>
          </div>
        )}

        {/* Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-[92vw] sm:w-105 h-[80vh] sm:h-145 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-cream-dark"
            >
              {/* Header */}
              <div className="p-4 bg-linear-to-r from-[#2e1065] via-[#4c1d95] to-[#5b21b6] text-white flex items-center justify-between border-b-2 border-purple-900/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#2e1065]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm text-white">Aria</h3>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                        Wellness AI
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-purple-200">
                      Safe & Non-Judgmental Companion
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCrisisModalOpen(true)}
                    title="Emergency Crisis Helplines"
                    className="p-2 text-coral hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleClearChat}
                    title="Reset Conversation"
                    className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleToggle}
                    className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="px-4 py-2 bg-cream/70 border-b-2 border-cream-dark flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBreathingMode(!isBreathingMode)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      isBreathingMode
                        ? "bg-brand text-white shadow-xs"
                        : "bg-white text-brand border border-cream-dark hover:border-brand"
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5" />
                    <span>{isBreathingMode ? "Exit Reset" : "2-Min Reset"}</span>
                  </button>
                </div>
                <span className="text-[10px] font-bold text-muted">
                  Not a therapist • Instant AI Care
                </span>
              </div>

              {/* Breathing Exercise Modal Overlay inside Chat */}
              {isBreathingMode && (
                <div className="p-6 bg-brand-light/90 border-b-2 border-cream-dark flex flex-col items-center text-center animate-in fade-in duration-200 shrink-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-brand mb-2">
                    Box Breathing Protocol (4-4-4-4)
                  </div>
                  <div className="w-20 h-20 rounded-full bg-brand text-white flex flex-col items-center justify-center font-black shadow-lg animate-pulse">
                    <span className="text-xs uppercase">{breathPhase}</span>
                  </div>
                  <p className="text-xs font-bold text-brand-dark mt-3">
                    Relax your shoulders and breathe slowly along with the circle.
                  </p>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-cream/30 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id || msg.content}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-brand text-white rounded-br-xs font-semibold shadow-xs"
                          : "bg-white border-2 border-cream-dark text-ink rounded-bl-xs font-medium shadow-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      <div className="mt-2 pt-1 border-t border-cream-dark/40 flex items-center justify-between text-[10px] text-muted">
                        <span>{msg.time}</span>
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => speakText(msg.id, msg.content)}
                            title="Read response aloud"
                            className="p-1 hover:text-brand transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {isSpeaking && activeSpeechId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-brand animate-pulse" />
                                <span className="font-bold text-brand">Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border-2 border-cream-dark p-3.5 rounded-2xl rounded-bl-xs flex items-center gap-2 shadow-xs">
                      <Sparkles className="w-4 h-4 text-brand animate-spin" />
                      <span className="text-xs font-bold text-muted">
                        Aria is reflecting...
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Suggestion Chips */}
              <div className="px-3 py-2 bg-cream/60 border-t-2 border-cream-dark overflow-x-auto flex gap-2 shrink-0">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-[11px] font-bold bg-white border border-cream-dark hover:border-brand px-3 py-1.5 rounded-xl text-ink transition-all hover:scale-102 shrink-0 cursor-pointer shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="p-3 bg-white border-t-2 border-cream-dark shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Share what's on your mind with Aria..."
                    className="flex-1 px-4 py-2.5 bg-cream/40 border-2 border-cream-dark rounded-2xl text-xs md:text-sm font-semibold text-ink placeholder:text-muted focus:outline-none focus:border-brand"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="p-3 bg-brand text-white rounded-2xl font-black hover:bg-brand-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Immediate Crisis Safety Modal */}
      <CrisisModal isOpen={isCrisisModalOpen} setIsOpen={setIsCrisisModalOpen} />
    </>
  );
};

export default ChatWidget;
