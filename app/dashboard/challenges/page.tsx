"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Play,
  ShieldCheck,
} from "lucide-react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/context/ToastContext";
import confetti from "canvas-confetti";

export default function ChallengesPage() {
  const { showToast, showXPToast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    setUpdatingId(challengeId);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, action: "JOIN" }),
      });

      if (res.ok) {
        showToast({ title: "Enrolled in challenge! Let's crush this 🔥", type: "success" });
        fetchChallenges();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogProgress = async (challengeId: string) => {
    setUpdatingId(challengeId);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, action: "INCREMENT" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.participant?.isCompleted) {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          showXPToast(200, "Conquered Habit Challenge!");
          showToast({ title: "🏆 Challenge Finished! +200 XP Awarded!", type: "success" });
        } else {
          showToast({ title: "Challenge progress logged!", type: "info" });
        }
        fetchChallenges();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Gamified Milestones & Streaks
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <Flame className="w-7 h-7 text-amber-500" />
          Habit Challenges
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Push your discipline with time-bound habit sprints and unlock substantial XP rewards.
        </p>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-60 bg-slate-800/40 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((ch) => {
            const progressPercent = Math.min(100, Math.round((ch.progressCount / ch.targetCount) * 100));

            return (
              <div
                key={ch.id}
                className={`p-6 rounded-3xl border transition-all duration-200 backdrop-blur-xl flex flex-col justify-between ${
                  ch.isCompleted
                    ? "bg-emerald-950/20 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                    : ch.isJoined
                    ? "bg-slate-900/70 border-indigo-500/40 shadow-sm"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                        <HabitIcon name={ch.badgeReward} className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-800 text-slate-300">
                          {ch.category} • {ch.durationDays} Days
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                          {ch.title}
                        </h3>
                      </div>
                    </div>

                    {ch.isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        +200 XP Reward
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    {ch.description}
                  </p>

                  {/* Progress Bar */}
                  {ch.isJoined && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Sprint Progress</span>
                        <span className="text-white">
                          {ch.progressCount} / {ch.targetCount} Days ({progressPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  {!ch.isJoined ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleJoinChallenge(ch.id)}
                      isLoading={updatingId === ch.id}
                      className="w-full"
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                      Join Challenge Sprint
                    </Button>
                  ) : ch.isCompleted ? (
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 w-full justify-center">
                      <Trophy className="w-4 h-4" />
                      Challenge Mastered & XP Claimed!
                    </div>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleLogProgress(ch.id)}
                      isLoading={updatingId === ch.id}
                      className="w-full"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Log Today&apos;s Challenge Milestone
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
