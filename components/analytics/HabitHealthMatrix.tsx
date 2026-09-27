"use client";

import React, { useState } from "react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { HabitHealthMetric } from "@/services/analyticsService";
import { Flame, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";

interface HabitHealthMatrixProps {
  habits: HabitHealthMetric[];
}

export function HabitHealthMatrix({ habits }: HabitHealthMatrixProps) {
  const [selectedHabit, setSelectedHabit] = useState<HabitHealthMetric | null>(null);

  if (!habits || habits.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No habits configured for health analysis
      </div>
    );
  }

  const getStatusBadge = (status: HabitHealthMetric["status"]) => {
    switch (status) {
      case "STRONG":
        return {
          label: "🟢 Strong (80%+)",
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: ShieldCheck,
        };
      case "STABLE":
        return {
          label: "🟡 Stable (60-79%)",
          bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
          icon: CheckCircle,
        };
      case "AT_RISK":
        return {
          label: "🟠 At Risk (40-59%)",
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: AlertTriangle,
        };
      case "NEEDS_ATTENTION":
        return {
          label: "🔴 Needs Attention (<40%)",
          bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: AlertTriangle,
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {habits.map((h) => {
          const badge = getStatusBadge(h.status);
          const StatusIcon = badge.icon;

          return (
            <div
              key={h.habitId}
              onClick={() => setSelectedHabit(h)}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all duration-150 backdrop-blur-md group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: `${h.color}15`,
                      border: `1px solid ${h.color}35`,
                    }}
                  >
                    <HabitIcon name={h.icon} className="w-5 h-5" color={h.color} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {h.habitName}
                    </h4>
                    <span className="text-[11px] text-slate-400">{h.category}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {h.statusText}
                </span>
              </div>

              {/* Adherence Bar & Stats */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">14-Day Adherence</span>
                  <span className="text-white">{h.completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${h.completionRate}%`,
                      backgroundColor:
                        h.completionRate >= 80
                          ? "#10b981"
                          : h.completionRate >= 60
                          ? "#6366f1"
                          : h.completionRate >= 40
                          ? "#f59e0b"
                          : "#f43f5e",
                    }}
                  />
                </div>
              </div>

              {/* Sub-metrics */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Streak: <strong className="text-white">{h.currentStreak}d</strong>
                </span>
                <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                  {h.explanation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
