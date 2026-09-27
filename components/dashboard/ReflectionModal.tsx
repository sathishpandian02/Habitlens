"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/context/ToastContext";
import { Smile, Sparkles } from "lucide-react";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    mood?: string;
    energyLevel?: string;
    notes?: string;
  } | null;
  onSaved?: () => void;
}

export function ReflectionModal({ isOpen, onClose, initialData, onSaved }: ReflectionModalProps) {
  const { showXPToast, showToast } = useToast();
  const [mood, setMood] = useState(initialData?.mood || "GOOD");
  const [energy, setEnergy] = useState(initialData?.energyLevel || "HIGH");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions = [
    { value: "GREAT", label: "Great", emoji: "😄", color: "border-emerald-500 bg-emerald-500/10 text-emerald-300" },
    { value: "GOOD", label: "Good", emoji: "🙂", color: "border-indigo-500 bg-indigo-500/10 text-indigo-300" },
    { value: "OKAY", label: "Okay", emoji: "😐", color: "border-amber-500 bg-amber-500/10 text-amber-300" },
    { value: "LOW", label: "Low", emoji: "😔", color: "border-purple-500 bg-purple-500/10 text-purple-300" },
    { value: "DIFFICULT", label: "Tough", emoji: "😫", color: "border-rose-500 bg-rose-500/10 text-rose-300" },
  ];

  const energyOptions = [
    { value: "HIGH", label: "High Energy ⚡", color: "border-emerald-500 text-emerald-400" },
    { value: "MEDIUM", label: "Medium Energy 🔋", color: "border-indigo-500 text-indigo-400" },
    { value: "LOW", label: "Low Energy 🪫", color: "border-rose-500 text-rose-400" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          energyLevel: energy,
          notes,
        }),
      });

      if (res.ok) {
        showXPToast(15, "Daily Reflection Recorded");
        showToast({ title: "Reflection saved! Keep learning from every day ✨", type: "success" });
        onSaved?.();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Daily Growth Reflection" subtitle="Track your mindset & energy to uncover deep behavioral trends">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            How was your day overall?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setMood(opt.value)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  mood === opt.value
                    ? `${opt.color} ring-2 ring-indigo-500 scale-105 shadow-md`
                    : "border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className="text-[11px] font-semibold">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            What was your energy level?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {energyOptions.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setEnergy(opt.value)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  energy === opt.value
                    ? `bg-indigo-500/20 border-indigo-500 text-white ring-1 ring-indigo-500`
                    : "border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Reflection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            What affected your focus or habits today?
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Morning routine gave me great energy. Deep work session went uninterrupted..."
            className="w-full p-3 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            <Sparkles className="w-4 h-4 mr-1" />
            Save Reflection (+15 XP)
          </Button>
        </div>
      </form>
    </Modal>
  );
}
