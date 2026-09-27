"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Flame,
  Target,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar,
  Smile,
  Plus,
  ArrowRight,
  ShieldCheck,
  Bot,
  Timer,
  RefreshCw,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CircularProgress } from "@/components/ui/CircularProgress";
import { TodayHabitCard, TodayHabitItem } from "@/components/dashboard/TodayHabitCard";
import { ReflectionModal } from "@/components/dashboard/ReflectionModal";
import { HabitModal } from "@/components/dashboard/HabitModal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/context/AuthContext";
import { useToast } from "@/components/context/ToastContext";
import confetti from "canvas-confetti";
import { getGreeting } from "@/lib/utils";

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dashRes, habitsRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/habits"),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboardData(data);
      }
      if (habitsRes.ok) {
        const habitsData = await habitsRes.json();
        setCategories(habitsData.categories || []);
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleHabitStatusChange = async (
    habitId: string,
    newStatus: "COMPLETED" | "SKIPPED" | "MISSED" | "PENDING"
  ) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const result = await res.json();
        // Optimistically update today's habits and daily score
        setDashboardData((prev: any) => {
          if (!prev) return prev;
          const updatedHabits = prev.todayHabits.map((h: TodayHabitItem) =>
            h.id === habitId
              ? {
                  ...h,
                  status: newStatus,
                  currentStreak: result.streak?.currentStreak ?? h.currentStreak,
                }
              : h
          );

          // Check if newly reached 100%
          if (result.dailyScore?.percentage === 100 && prev.todayScore < 100) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }

          return {
            ...prev,
            todayHabits: updatedHabits,
            todayScore: result.dailyScore?.percentage ?? prev.todayScore,
            dailyScoreBreakdown: result.dailyScore ?? prev.dailyScoreBreakdown,
          };
        });

        await refreshUser();
      }
    } catch (e) {
      console.error(e);
      showToast({ title: "Failed to update habit status", type: "error" });
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-800/40 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-800/40 rounded-3xl" />
      </div>
    );
  }

  const {
    greeting,
    personaType,
    todayScore,
    dailyScoreBreakdown,
    currentStreak,
    weeklyScore,
    wowDifference,
    wowInterpretation,
    monthlyScore,
    habitLensScore,
    recoveryScore,
    level,
    totalXp,
    xpProgress,
    todayHabits,
    todayReflection,
    banner,
  } = dashboardData;

  const completedCount = dailyScoreBreakdown?.completed || 0;
  const totalCount = dailyScoreBreakdown?.totalScheduled || todayHabits.length || 1;

  const currentUserName = user?.fullName?.trim() || user?.username?.trim();
  const dynamicGreeting = currentUserName ? getGreeting(currentUserName) : (greeting || getGreeting());

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Welcome Greeting & Identity Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              {personaType} • Growth Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {dynamicGreeting}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Let&apos;s make today count. Track your habits and compound your progress.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReflectionModal(true)}
            className={todayReflection ? "border-emerald-500/30 text-emerald-400" : ""}
          >
            <Smile className="w-4 h-4 mr-1 text-amber-400" />
            {todayReflection ? "Reflection Saved ✓" : "Log Daily Reflection"}
          </Button>

          <Button variant="primary" size="sm" onClick={() => setShowHabitModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* 2. Dynamic Smart Home Motivational Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border backdrop-blur-xl flex items-start sm:items-center justify-between gap-4 ${
          banner.type === "success"
            ? "bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-900/80 border-emerald-500/30 text-emerald-100"
            : banner.type === "warning"
            ? "bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-slate-900/80 border-amber-500/30 text-amber-100"
            : "bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/80 border-indigo-500/30 text-indigo-100"
        }`}
      >
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            {banner.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{banner.message}</p>
        </div>
        <a
          href="/dashboard/ai-coach"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex-shrink-0"
        >
          <Bot className="w-3.5 h-3.5" />
          Ask AI Coach
        </a>
      </div>

      {/* 3. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Today's Score"
          value={`${todayScore}%`}
          subtitle={`${completedCount}/${totalCount} Completed`}
          icon={<CheckCircle2 className="w-5 h-5 text-indigo-400" />}
          highlight={todayScore === 100}
        />
        <KpiCard
          title="Current Streak"
          value={`🔥 ${currentStreak}d`}
          subtitle="Keep fire burning"
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          title="Weekly Score"
          value={`${weeklyScore}%`}
          trend={{
            value: `${Math.abs(wowDifference)}%`,
            direction: wowDifference >= 0 ? "up" : "down",
            label: "vs last week",
          }}
          icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}
        />
        <KpiCard
          title="Monthly Score"
          value={`${monthlyScore}%`}
          subtitle="Past 30 Days"
          icon={<TrendingUp className="w-5 h-5 text-sky-400" />}
        />
        <KpiCard
          title="Level / XP"
          value={`Lv ${level}`}
          subtitle={`${totalXp} Total XP`}
          icon={<Sparkles className="w-5 h-5 text-purple-400" />}
        />
        <KpiCard
          title="HabitLens Score"
          value={`${habitLensScore}/100`}
          subtitle={`Recovery: ${recoveryScore}%`}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          highlight
        />
      </div>

      {/* 4. Main Section: Circular Daily Progress + Today's Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Circular Progress & Week-over-Week Insights */}
        <div className="space-y-6">
          {/* Circular Score Widget */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Today&apos;s Habit Score
            </h3>

            <CircularProgress
              percentage={todayScore}
              size={170}
              strokeWidth={14}
              color={todayScore >= 80 ? "#10b981" : todayScore >= 50 ? "#6366f1" : "#f59e0b"}
              label="COMPLETION"
              subtitle={`${completedCount} of ${totalCount} Done`}
            />

            <div className="w-full grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Completed</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{completedCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
                <p className="text-sm font-bold text-indigo-400 mt-0.5">{dailyScoreBreakdown?.pending || 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Skipped</p>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{dailyScoreBreakdown?.skipped || 0}</p>
              </div>
            </div>
          </div>

          {/* Week-over-Week Intelligence Summary */}
          <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Week-over-Week Lens
              </span>
              <span className="text-xs font-bold text-slate-300">
                {weeklyScore}% vs {dashboardData.prevWeeklyScore}%
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{wowInterpretation}</p>

            <a
              href="/dashboard/analytics"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-1"
            >
              Open Full Analytics Lens
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Focus Mode Trigger */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Focus Mode (Pomodoro)</h4>
                <p className="text-[11px] text-slate-400">Lock in a 25m distraction-free block</p>
              </div>
            </div>
            <a
              href="/dashboard/focus"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
            >
              Start Focus
            </a>
          </div>
        </div>

        {/* Right Column: Today's Habits List */}
        <div id="today-habits" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Today&apos;s Habits
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tap check to complete, or forward icon to skip planned rest
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {todayHabits.length} Scheduled
            </span>
          </div>

          {todayHabits.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No habits scheduled for today</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create your first habit or adjust your scheduled days to start building consistency.
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowHabitModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayHabits.map((habit: TodayHabitItem) => (
                <TodayHabitCard
                  key={habit.id}
                  habit={habit}
                  onStatusChange={handleHabitStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reflection Modal */}
      <ReflectionModal
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        initialData={todayReflection}
        onSaved={fetchDashboardData}
      />

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        categories={categories}
        onSaved={fetchDashboardData}
      />
    </div>
  );
}
