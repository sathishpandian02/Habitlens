"use client";

import React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";

interface PlanDay {
  day: string;
  habit: string;
  focusNote: string;
}

interface WeeklyPlanCardProps {
  plan: PlanDay[];
}

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h4 className="text-sm font-bold text-white tracking-tight">
            Your 7-Day Personalized Improvement Plan
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Generated from Historical Logs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {plan.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/40 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {item.day}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <h5 className="text-sm font-bold text-white mb-1.5">{item.habit}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{item.focusNote}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
