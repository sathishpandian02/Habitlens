"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/context/ToastContext";
import confetti from "canvas-confetti";

export default function FocusModePage() {
  const { showToast, showXPToast } = useToast();
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [notes, setNotes] = useState("");
  const [habits, setHabits] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFocusData = async () => {
    try {
      const res = await fetch("/api/focus");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setTotalMinutes(data.totalMinutes || 0);
        setHabits(data.habits || []);
        if (data.habits?.length > 0 && !selectedHabitId) {
          setSelectedHabitId(data.habits[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFocusData();
  }, []);

  const handlePresetSelect = (minutes: number) => {
    setIsActive(false);
    setSelectedMinutes(minutes);
    setTimeLeft(minutes * 60);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleCompleteSession();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleCompleteSession = async () => {
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    try {
      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: selectedMinutes,
          sessionType: selectedMinutes >= 45 ? "DEEP_WORK" : "POMODORO",
          habitId: selectedHabitId || null,
          notes,
        }),
      });

      if (res.ok) {
        showXPToast(selectedMinutes, `Completed ${selectedMinutes}m Focus Block`);
        showToast({ title: "Focus session recorded! Outstanding discipline ✨", type: "success" });
        setTimeLeft(selectedMinutes * 60);
        fetchFocusData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.round(((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto pb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          High-Leverage Deep Work
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <Timer className="w-7 h-7 text-indigo-400" />
          Focus Mode & Pomodoro
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Eliminate distractions, build uninterrupted deep focus blocks, and automatically tie sessions to your study and work habits.
        </p>
      </div>

      {/* Main Timer Dial Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Preset Selector Chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap relative z-10">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => handlePresetSelect(m)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedMinutes === m
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 scale-105"
                  : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              {m} Min {m >= 45 ? "Deep Work" : "Sprint"}
            </button>
          ))}
        </div>

        {/* Digital Time Display */}
        <div className="relative z-10">
          <div className="text-6xl sm:text-8xl font-black text-white tracking-tighter font-mono">
            {formattedTime}
          </div>
          <div className="w-64 sm:w-80 h-2 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Linked Habit & Note Input */}
        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">
              Link to Habit
            </label>
            <select
              value={selectedHabitId}
              onChange={(e) => setSelectedHabitId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">General Focus</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-left">
              Session Goal
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chapter 4 algorithms"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 relative z-10 pt-2">
          <Button
            variant={isActive ? "secondary" : "primary"}
            size="lg"
            onClick={() => setIsActive(!isActive)}
            className="px-8 shadow-xl"
          >
            {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2 fill-white" />}
            {isActive ? "Pause Focus" : "Start Focus Session"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setIsActive(false);
              setTimeLeft(selectedMinutes * 60);
            }}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Focus History & Total Minutes */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Focus Log History</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Focus Accumulated: <strong className="text-indigo-400">{totalMinutes} minutes</strong>
            </p>
          </div>
        </CardHeader>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No focus sessions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {sessions.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">
                      {s.habit?.name || s.sessionType} ({s.durationMinutes}m)
                    </h5>
                    {s.notes && <p className="text-[11px] text-slate-400">{s.notes}</p>}
                  </div>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {new Date(s.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
