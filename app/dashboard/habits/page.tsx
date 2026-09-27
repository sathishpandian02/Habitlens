"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ListTodo,
  Plus,
  Search,
  Pause,
  Play,
  Trash2,
  Edit2,
  ExternalLink,
  Flame,
  Clock,
  Archive,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Button } from "@/components/ui/Button";
import { HabitModal } from "@/components/dashboard/HabitModal";
import { useToast } from "@/components/context/ToastContext";

export default function ManageHabitsPage() {
  const { showToast } = useToast();
  const [habits, setHabits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<any | null>(null);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data.habits || []);
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Habits fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleTogglePause = async (habit: any) => {
    try {
      const res = await fetch(`/api/habits/${habit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaused: !habit.isPaused }),
      });

      if (res.ok) {
        showToast({
          title: habit.isPaused ? `Resumed "${habit.name}"` : `Paused "${habit.name}"`,
          type: "info",
        });
        fetchHabits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (habit: any) => {
    if (!confirm(`Are you sure you want to delete "${habit.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({ title: `Deleted "${habit.name}"`, type: "success" });
        fetchHabits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredHabits = habits.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || h.category?.name === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Habit Configuration & Cadence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-indigo-400" />
            Manage Habits
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Add, customize, pause, or analyze individual habit metrics and schedules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setHabitToEdit(null);
            setShowHabitModal(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create New Habit
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your habits..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800/60 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Habit Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">No habits found</h4>
          <p className="text-xs text-slate-400">Try adjusting your search or add a new habit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => {
            const streak = habit.streaks[0]?.currentStreak || 0;
            const consistency = habit.streaks[0]?.consistencyScore || 0;

            return (
              <div
                key={habit.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between backdrop-blur-md ${
                  habit.isPaused
                    ? "bg-slate-900/30 border-slate-800/60 opacity-60"
                    : "bg-slate-900/60 border-slate-800 hover:border-indigo-500/40 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${habit.color}15`,
                          border: `1px solid ${habit.color}35`,
                        }}
                      >
                        <HabitIcon name={habit.icon} className="w-5 h-5" color={habit.color} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {habit.name}
                        </h4>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase"
                          style={{
                            backgroundColor: `${habit.category?.color || habit.color}15`,
                            color: habit.category?.color || habit.color,
                          }}
                        >
                          {habit.category?.name || "General"}
                        </span>
                      </div>
                    </div>

                    {habit.isPaused && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        PAUSED
                      </span>
                    )}
                  </div>

                  {habit.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                      {habit.description}
                    </p>
                  )}

                  {/* Target & Schedule */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 py-2 border-y border-slate-800/60">
                    <span className="font-semibold text-slate-200">
                      {habit.goalTarget} {habit.goalUnit}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{habit.frequencyType.toLowerCase()}</span>
                    {habit.reminderTime && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {habit.reminderTime}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Streak & Consistency */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {streak}d Streak
                    </span>
                    <span className="text-indigo-400 font-semibold">
                      {consistency}% Consistency
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60">
                  <Link
                    href={`/dashboard/habits/${habit.id}`}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Analytics <ExternalLink className="w-3 h-3" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePause(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={habit.isPaused ? "Resume Habit" : "Pause Habit"}
                    >
                      {habit.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setHabitToEdit(habit);
                        setShowHabitModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={showHabitModal}
        onClose={() => {
          setShowHabitModal(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
        categories={categories}
        onSaved={fetchHabits}
      />
    </div>
  );
}
