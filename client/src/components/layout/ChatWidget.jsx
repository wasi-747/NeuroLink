import React, { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Add initial greeting when opening for the first time
      setMessages([
        {
          role: "assistant",
          content: `Hi ${user?.name || "there"}! I'm Aria, your AI wellness companion. I'm here to listen. Remember, I'm an AI, not a therapist. What's on your mind today?`,
        },
      ]);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/ml/chat", {
        messages: newMessages,
        user_context: {
          name: user?.name,
          // future: pass recent_mood, top_issue etc.
        },
      });

      setMessages([
        ...newMessages,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (error) {
      toast.error("Aria is taking a break. Please try again later.");
      setMessages(messages); // Revert to previous state on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hi ${user?.name || "there"}! I'm Aria, your AI wellness companion. I'm here to listen. Remember, I'm an AI, not a therapist. What's on your mind today?`,
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Chat Bubble */}
      {!isOpen && (
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-brand/30 animate-ping opacity-75" />
          <motion.button
            onClick={handleToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-14 bg-brand rounded-3xl shadow-lg shadow-brand/40 text-white text-2xl flex items-center justify-center"
          >
            💬
          </motion.button>
          <div className="absolute bottom-16 right-0 whitespace-nowrap bg-ink text-white text-xs font-bold rounded-xl px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with Aria ✨
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-95 h-130 bg-white rounded-3xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b-2 border-cream-dark flex justify-between items-center bg-brand-light/40">
            <div>
              <h3 className="font-bold text-ink">Aria - Wellness Companion</h3>
              <span className="text-xs bg-golden/20 text-golden px-2 py-0.5 rounded-full font-semibold">
                AI support, not therapy
              </span>
            </div>
            <div>
              <button
                onClick={handleClearChat}
                className="p-2 text-muted hover:text-ink hover:bg-cream-dark rounded-2xl transition-colors mr-2"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleToggle}
                className="p-2 text-muted hover:text-ink hover:bg-cream-dark rounded-2xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-2 text-center bg-coral/10 border-b-2 border-coral/20">
            <p className="text-xs text-coral font-semibold">
              For emergencies, call your local crisis line.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-cream/30">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl font-medium ${
                      msg.role === "user"
                        ? "bg-brand text-white rounded-br-lg"
                        : "bg-cream-dark text-ink rounded-bl-lg"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-cream-dark text-ink p-3 rounded-2xl rounded-bl-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-brand" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t-2 border-cream-dark">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="input-field flex-1"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                className="btn-primary px-3! py-2.5!"
                disabled={isLoading || input.trim() === ""}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
