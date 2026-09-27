"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Flame,
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { ProgressTrendChart } from "@/components/analytics/ProgressTrendChart";
import { WeekComparisonBarChart } from "@/components/analytics/WeekComparisonBarChart";
import { CategoryDistributionChart } from "@/components/analytics/CategoryDistributionChart";
import { HabitHeatmap } from "@/components/analytics/HabitHeatmap";
import { HabitHealthMatrix } from "@/components/analytics/HabitHealthMatrix";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/dashboard/KpiCard";

export default function AnalyticsLensPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "365d">("30d");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}&category=${selectedCategory}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedCategory]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-slate-800/40 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800/40 rounded-3xl" />
          <div className="h-80 bg-slate-800/40 rounded-3xl" />
        </div>
        <div className="h-64 bg-slate-800/40 rounded-3xl" />
      </div>
    );
  }

  const {
    trendData,
    dayDistribution,
    categoryStats,
    heatmapData,
    personalBests,
    predictiveInsight,
    weeklyScore,
    wowDifference,
    wowInterpretation,
    monthlyScore,
    habitLensScore,
    recoveryScore,
    habitHealthList,
    availableCategories,
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Deep Behavioral Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Analytics Lens
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-dimensional trend analysis, category distribution, and habit health matrices.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            {(["7d", "30d", "90d", "365d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  period === p
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {availableCategories?.map((c: string) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Week-over-Week & Predictive Insight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Week-over-Week Trajectory
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                wowDifference >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              }`}
            >
              {wowDifference >= 0 ? `↑ +${wowDifference}%` : `↓ ${wowDifference}%`}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {wowInterpretation}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Predictive Consistency Forecast
            </span>
            <span className="text-xs font-bold text-indigo-300">
              ~{predictiveInsight.projectedMonthlyRate}% Projected
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {predictiveInsight.summary}
          </p>
        </div>
      </div>

      {/* Top 4 Metric Summaries */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          title="Best Day Record"
          value={personalBests.bestDayScore}
          subtitle="Highest single-day score"
          icon={<Zap className="w-5 h-5 text-amber-400" />}
        />
        <KpiCard
          title="Longest Streak"
          value={personalBests.longestStreak}
          subtitle="Peak consistency record"
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          title="Habits Logged"
          value={personalBests.totalCompletedHabits}
          subtitle="All-time completed sessions"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <KpiCard
          title="HabitLens Composite"
          value={`${habitLensScore}/100`}
          subtitle={`Recovery Index: ${recoveryScore}%`}
          icon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
          highlight
        />
      </div>

      {/* Charts Row 1: Progress Trend AreaChart & Day-of-Week BarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Habit Progress Trajectory</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily completion percentage across selected interval
              </p>
            </div>
          </CardHeader>
          <ProgressTrendChart data={trendData} />
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Weekly Day-by-Day Consistency</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Average completion rate clustered across days of the week
              </p>
            </div>
          </CardHeader>
          <WeekComparisonBarChart data={dayDistribution} />
        </Card>
      </div>

      {/* Charts Row 2: Category Distribution & Annual Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div>
              <CardTitle>Category Distribution</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Habit completion balance across life areas
              </p>
            </div>
          </CardHeader>
          <CategoryDistributionChart data={categoryStats} />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>365-Day Consistency Heatmap</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                GitHub-style annual habit intensity and streak persistence
              </p>
            </div>
          </CardHeader>
          <HabitHeatmap data={heatmapData} />
        </Card>
      </div>

      {/* Habit Health Matrix Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Habit Health & Strength Matrix</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated classification into 🟢 Strong, 🟡 Stable, 🟠 At Risk, and 🔴 Needs Attention
            </p>
          </div>
        </CardHeader>
        <HabitHealthMatrix habits={habitHealthList} />
      </Card>
    </div>
  );
}
