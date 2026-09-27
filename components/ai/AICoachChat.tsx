"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AICoachChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Hello! I am your **HabitLens AI Coach**.\n\nI have full context of your actual habit tracking records, streaks, and progress. I can analyze your performance or help you with **focus, discipline, consistency, time management, and general self-improvement**.\n\nWhat would you like advice on today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exactly the 3 requested clean quick prompts
  const QUICK_PROMPTS = [
    "Analyze my habits",
    "What should I improve?",
    "Give me advice",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = updatedMessages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call the AI Coach endpoint
      const res = await fetch("/api/ai-coach/analyze-and-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Fallback to /api/ai/chat if primary route fails
        const fallbackRes = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: query }),
        });

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const assistantMsg: Message = {
            id: Math.random().toString(36).substring(2, 9),
            role: "assistant",
            content: fallbackData.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              role: "assistant",
              content: "I had trouble analyzing your habit data just now. Please ask again in a moment.",
              timestamp: "Now",
            },
          ]);
        }
      }
    } catch (e) {
      console.error("AI Coach Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: "assistant",
          content: "Network issue connecting to AI service. Please check your connection and try again.",
          timestamp: "Now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Clean Minimal Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              HabitLens AI Coach
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <p className="text-[11px] text-slate-400">Contextualized on your personal habit records</p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
          Online
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === "user"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                m.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-100 rounded-tl-sm"
              }`}
            >
              {m.content}
              <div
                className={`text-[10px] mt-2 font-medium ${
                  m.role === "user" ? "text-indigo-200 text-right" : "text-slate-400"
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-2 rounded-tl-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              Thinking &amp; analyzing your habit context...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Small Quick Prompts Chips */}
      <div className="px-6 py-2.5 bg-slate-900/60 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-all border border-slate-700/70 hover:border-indigo-500/50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your habits, progress or self-improvement..."
            disabled={loading}
            className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-800/70 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-400 transition-colors"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
