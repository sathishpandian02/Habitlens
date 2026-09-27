"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/context/ToastContext";

export default function GoalsPage() {
  const { showToast, showXPToast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [userHabits, setUserHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New goal form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Personal Growth");
  const [targetDate, setTargetDate] = useState("");
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
        setUserHabits(data.userHabits || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({ title: "Please enter a goal title", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          targetDate: targetDate || null,
          linkedHabits: selectedHabitIds.map((id) => ({ habitId: id, weight: 1.0 })),
        }),
      });

      if (res.ok) {
        showXPToast(50, "Created Strategic Goal");
        showToast({ title: "New goal created with linked habits!", type: "success" });
        setTitle("");
        setDescription("");
        setSelectedHabitIds([]);
        setShowCreateModal(false);
        fetchGoals();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHabitLink = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Goal → Habits → Daily Actions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-400" />
            Strategic Personal Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Link high-level ambitions to daily micro-habits and watch your cumulative progress advance.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Create New Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-800/40 rounded-3xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <Target className="w-8 h-8 text-indigo-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">No strategic goals created yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Connect your daily habits to a larger milestone like &ldquo;Crack Full-Stack Engineering&rdquo; or &ldquo;Run a Half Marathon&rdquo;.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all backdrop-blur-xl shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {goal.category}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 leading-snug">
                      {goal.title}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-400">
                      {goal.progressPercentage}%
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Progress</p>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${goal.progressPercentage}%` }}
                  />
                </div>

                {/* Connected Habits Chips */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Connected Daily Habits ({goal.goalHabits.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {goal.goalHabits.map((gh: any) => (
                      <div
                        key={gh.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold text-white"
                      >
                        <HabitIcon name={gh.habit.icon} className="w-3.5 h-3.5" color={gh.habit.color} />
                        <span>{gh.habit.name}</span>
                        <span className="text-amber-400 text-[11px]">
                          🔥 {gh.habit.streaks[0]?.currentStreak || 0}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Strategic Recommendation */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300 bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-indigo-300">AI Recommendation: </strong>
                  Maintain your daily consistency in {goal.goalHabits[0]?.habit.name || "connected habits"} to hit projected completion by your target date.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Strategic Goal"
        subtitle="Establish a major objective and link daily habits to drive automated progress tracking"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Full-Stack Architecture, Run 10k Marathon"
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white"
            >
              <option value="Study">Study & Academics</option>
              <option value="Fitness">Fitness & Health</option>
              <option value="Personal Growth">Personal Growth</option>
              <option value="Productivity">Productivity & Career</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Milestone
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what success looks like for this goal..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Link Habits (Select which habits feed this goal)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
              {userHabits.map((h) => {
                const isSelected = selectedHabitIds.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHabitLink(h.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-indigo-600/30 border-indigo-500 text-white"
                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="truncate">{h.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              Create Goal (+50 XP)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
