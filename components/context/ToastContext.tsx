"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from "lucide-react";

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: "success" | "error" | "info" | "xp";
  xpAmount?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  showXPToast: (amount: number, reason: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showXPToast: () => {},
});

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const showXPToast = useCallback(
    (amount: number, reason: string) => {
      showToast({
        title: `+${amount} XP Earned!`,
        message: reason,
        type: "xp",
        xpAmount: amount,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showXPToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              t.type === "xp"
                ? "bg-indigo-950/90 border-indigo-500/50 text-indigo-100 shadow-indigo-500/20"
                : t.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-500/20"
                : t.type === "error"
                ? "bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-500/20"
                : "bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/40"
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === "xp" ? (
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : t.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Info className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold tracking-wide">{t.title}</h4>
              {t.message && <p className="text-xs text-slate-300 mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
