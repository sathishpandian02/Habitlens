"use client";

import React from "react";
import { Sparkles, Compass, Target, ArrowRight } from "lucide-react";
import { AIDiagnostic } from "@/services/aiService";

interface AIDiagnosticsCardProps {
  diagnostics: AIDiagnostic | null;
  isLoading?: boolean;
}

export function AIDiagnosticsCard({ diagnostics, isLoading = false }: AIDiagnosticsCardProps) {
  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-4">
        <div className="h-4 w-1/3 bg-slate-800 rounded" />
        <div className="h-8 w-full bg-slate-800 rounded" />
        <div className="h-16 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  if (!diagnostics) return null;

  return (
    <div className="space-y-4">
      {/* Primary Diagnostic Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-900/90 border border-indigo-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            HabitLens AI Intelligence Diagnosis
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed mb-3">
          {diagnostics.insight}
        </h3>

        {/* Recommended Action */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-500/20 mt-4">
          <div className="flex items-center gap-2 mb-1 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            Recommended Strategic Action
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {diagnostics.recommendedAction}
          </p>
        </div>
      </div>

      {/* This Week's Focus Targets */}
      <div className="rounded-2xl p-5 bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          This Week&apos;s Focus Habits
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {diagnostics.focusHabits.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
            >
              <div>
                <h5 className="text-xs font-bold text-white">{item.name}</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">{item.target}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
