"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  Target,
} from "lucide-react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { HabitModal } from "@/components/dashboard/HabitModal";
import { useToast } from "@/components/context/ToastContext";

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const habitId = params.id as string;

  const [habitData, setHabitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchHabitDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/habits/${habitId}`);
      if (res.ok) {
        const data = await res.json();
        setHabitData(data);
      } else {
        router.push("/dashboard/habits");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habitId) fetchHabitDetail();
  }, [habitId]);

  if (loading || !habitData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-32 bg-slate-800/40 rounded-xl" />
        <div className="h-44 bg-slate-800/40 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { habit, analytics } = habitData;

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${habit.name}"?`)) return;
    try {
      const res = await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({ title: "Habit deleted", type: "success" });
        router.push("/dashboard/habits");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button */}
      <Link
        href="/dashboard/habits"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Habits
      </Link>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${habit.color}15`,
              border: `1px solid ${habit.color}35`,
            }}
          >
            <HabitIcon name={habit.icon} className="w-8 h-8" color={habit.color} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider"
                style={{
                  backgroundColor: `${habit.category?.color || habit.color}15`,
                  color: habit.category?.color || habit.color,
                }}
              >
                {habit.category?.name || "General"}
              </span>
              <span className="text-xs text-slate-400">
                • {habit.frequencyType.toLowerCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{habit.name}</h1>
            {habit.description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            Edit Habit
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          title="Current Streak"
          value={`🔥 ${analytics.currentStreak}d`}
          subtitle={`Best: ${analytics.bestStreak} days`}
          icon={<Flame className="w-5 h-5 text-amber-500" />}
        />
        <KpiCard
          title="30-Day Completion"
          value={`${analytics.completionRate}%`}
          subtitle={`${analytics.completedPast30} / 30 Days`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        />
        <KpiCard
          title="Daily Goal Target"
          value={`${habit.goalTarget} ${habit.goalUnit}`}
          subtitle={habit.reminderTime ? `Reminder: ${habit.reminderTime}` : "No alarm set"}
          icon={<Target className="w-5 h-5 text-indigo-400" />}
        />
        <KpiCard
          title="Habit Strength"
          value={analytics.completionRate >= 80 ? "Strong 🟢" : analytics.completionRate >= 60 ? "Stable 🟡" : "At Risk 🟠"}
          subtitle="Automated consistency score"
          icon={<ShieldCheck className="w-5 h-5 text-purple-400" />}
        />
      </div>

      {/* 30-Day Log Matrix */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>30-Day Adherence Matrix</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily status inspection over the last 30 consecutive days
            </p>
          </div>
        </CardHeader>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {analytics.monthLogs.map((log: any, idx: number) => {
            const isCompleted = log.status === "COMPLETED";
            const isSkipped = log.status === "SKIPPED";

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : isSkipped
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                    : "bg-slate-800/40 border-slate-800 text-slate-500"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 mb-1">
                  {log.date.substring(5)}
                </span>
                <span className="text-xs font-bold">
                  {isCompleted ? "✓ Done" : isSkipped ? "↷ Skip" : "✗ Miss"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Edit Modal */}
      <HabitModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        habitToEdit={habit}
        categories={[]}
        onSaved={fetchHabitDetail}
      />
    </div>
  );
}
