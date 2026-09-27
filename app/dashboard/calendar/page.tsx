"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Smile,
  Zap,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export default function HabitCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchCalendarDetails = async () => {
    setLoading(true);
    try {
      const [habitsRes, reflectionRes] = await Promise.all([
        fetch("/api/habits"),
        fetch(`/api/reflections?date=${selectedDateStr}`),
      ]);

      const habitsData = await habitsRes.json();
      const refData = await reflectionRes.json();

      setCalendarData({
        habits: habitsData.habits || [],
        reflection: refData.reflection || null,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarDetails();
  }, [selectedDateStr]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Chronological Adherence Record
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-400" />
            Habit Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Inspect historical consistency, review daily reflections, and explore future schedules.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-xs font-bold text-white min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar & Day Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Calendar Grid */}
        <Card className="lg:col-span-2">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 pb-3 border-b border-slate-800 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-2">
            {daysInterval.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isTodayDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[85px] sm:min-h-[95px] p-2 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg scale-[1.02]"
                      : isCurrentMonthDay
                      ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40"
                      : "bg-slate-900/10 border-slate-800/30 opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isTodayDay
                          ? "px-1.5 py-0.5 rounded-full bg-indigo-600 text-white"
                          : isSelected
                          ? "text-indigo-400"
                          : "text-slate-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {isTodayDay && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>

                  {/* Micro Habit Dots */}
                  <div className="flex items-center gap-1 mt-auto">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Day Inspector Panel */}
        <Card className="space-y-5">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-indigo-400" />
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {isToday(selectedDate) ? "Today's Schedule & Journal" : "Historical Inspection"}
              </p>
            </div>
          </CardHeader>

          {/* Daily Reflection Snippet if present */}
          {calendarData?.reflection ? (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-300 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-400" />
                  Recorded Mood: {calendarData.reflection.mood}
                </span>
                <span className="text-slate-400 capitalize">
                  {calendarData.reflection.energyLevel} Energy
                </span>
              </div>
              {calendarData.reflection.notes && (
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;{calendarData.reflection.notes}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
              No daily reflection note recorded for this date.
            </div>
          )}

          {/* Scheduled Habits on that Day */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scheduled Habits
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {calendarData?.habits.map((h: any) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${h.color}15` }}
                    >
                      <HabitIcon name={h.icon} className="w-4 h-4" color={h.color} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{h.name}</h5>
                      <span className="text-[10px] text-slate-400">
                        {h.goalTarget} {h.goalUnit}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {h.streaks[0]?.currentStreak || 0}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
