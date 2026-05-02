import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Trash2 } from "lucide-react";
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-110 flex items-center gap-2"
        >
          <MessageSquare size={24} />
          <span className="font-semibold">Aria</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <div>
              <h3 className="font-bold text-gray-800">
                Aria - AI Wellness Companion
              </h3>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
                AI, not a therapist
              </span>
            </div>
            <div>
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors mr-2"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleToggle}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-2 text-center bg-red-50 border-b border-red-100">
            <p className="text-xs text-red-700">
              For emergencies, call your local crisis line.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white rounded-br-lg"
                        : "bg-gray-200 text-gray-800 rounded-bl-lg"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-bl-lg">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
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
