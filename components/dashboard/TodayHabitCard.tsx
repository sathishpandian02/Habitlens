"use client";

import React, { useState } from "react";
import { Check, Flame, Clock, SkipForward, Sparkles, MessageSquare, MoreHorizontal } from "lucide-react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { useToast } from "@/components/context/ToastContext";
import confetti from "canvas-confetti";

export interface TodayHabitItem {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  categoryColor: string;
  goalTarget: number;
  goalUnit: string;
  reminderTime?: string;
  priority: string;
  difficulty: string;
  status: "COMPLETED" | "SKIPPED" | "MISSED" | "PENDING";
  isScheduledToday: boolean;
  currentStreak: number;
  bestStreak: number;
  notes?: string;
  completedAt?: string;
}

interface TodayHabitCardProps {
  habit: TodayHabitItem;
  onStatusChange: (habitId: string, newStatus: "COMPLETED" | "SKIPPED" | "MISSED" | "PENDING") => Promise<void>;
}

export function TodayHabitCard({ habit, onStatusChange }: TodayHabitCardProps) {
  const { showXPToast, showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState(habit.notes || "");

  const isCompleted = habit.status === "COMPLETED";
  const isSkipped = habit.status === "SKIPPED";

  const handleToggleComplete = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const nextStatus = isCompleted ? "PENDING" : "COMPLETED";
      await onStatusChange(habit.id, nextStatus);

      if (nextStatus === "COMPLETED") {
        // Trigger micro celebratory confetti
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: [habit.color || "#6366f1", "#10b981", "#fbbf24"],
        });

        showXPToast(10, `Completed "${habit.name}"`);
        showToast({
          title: "Nice! One step closer to your goal 🔥",
          type: "success",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const nextStatus = isSkipped ? "PENDING" : "SKIPPED";
      await onStatusChange(habit.id, nextStatus);
      showToast({
        title: isSkipped ? "Habit un-skipped" : `Skipped "${habit.name}" for today (streak preserved)`,
        type: "info",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl p-4 sm:p-5 border transition-all duration-200 backdrop-blur-xl ${
        isCompleted
          ? "bg-emerald-950/20 border-emerald-500/30 shadow-sm shadow-emerald-500/5"
          : isSkipped
          ? "bg-slate-900/40 border-slate-800/80 opacity-70"
          : "bg-white/80 dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Habit Icon Container */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: `${habit.color}15`,
            border: `1px solid ${habit.color}35`,
          }}
        >
          <HabitIcon name={habit.icon} className="w-6 h-6" color={habit.color} />
        </div>

        {/* Habit Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm sm:text-base font-bold tracking-tight truncate ${
                isCompleted
                  ? "line-through text-slate-400 dark:text-slate-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {habit.name}
            </h4>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider"
              style={{
                backgroundColor: `${habit.categoryColor}15`,
                color: habit.categoryColor,
                border: `1px solid ${habit.categoryColor}30`,
              }}
            >
              {habit.category}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {habit.goalTarget} {habit.goalUnit}
            </span>
            {habit.reminderTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {habit.reminderTime}
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {habit.currentStreak}d
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            disabled={isUpdating}
            className={`p-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
              isSkipped
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700"
            }`}
            title={isSkipped ? "Resume Habit" : "Skip Habit (Planned Rest)"}
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Complete Button */}
          <button
            onClick={handleToggleComplete}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-md ${
              isCompleted
                ? "bg-emerald-500 text-white shadow-emerald-500/25 active:scale-95 animate-check"
                : "bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 active:scale-95"
            }`}
          >
            <Check className={`w-4 h-4 ${isCompleted ? "stroke-[3]" : ""}`} />
            <span className="hidden sm:inline">{isCompleted ? "Done" : "Complete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
