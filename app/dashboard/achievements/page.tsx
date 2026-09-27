"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Award,
  Crown,
  BookOpen,
  Star,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { HabitIcon } from "@/components/ui/HabitIcon";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/components/context/AuthContext";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const totalBadges = achievements.length;
  const unlockedBadges = achievements.filter((a) => a.isUnlocked).length;
  const unlockedPercent = totalBadges > 0 ? Math.round((unlockedBadges / totalBadges) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Gamification Engine & Mastery
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500" />
          Badges & Achievements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Unlock milestone badges as you compound your streaks, consistency, and daily habits.
        </p>
      </div>

      {/* Showcase Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-lg">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Level {user?.gamification?.level || 6} Mastery
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {unlockedBadges} of {totalBadges} Badges Unlocked
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.gamification?.totalXp || 1340} Total Experience Points Earned
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">Mastery Progress</span>
            <span className="text-emerald-400">{unlockedPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${unlockedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((ach) => {
          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between backdrop-blur-xl ${
                ach.isUnlocked
                  ? "bg-slate-900/80 border-indigo-500/40 shadow-md shadow-indigo-500/5"
                  : "bg-slate-900/40 border-slate-800/80 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                      ach.isUnlocked
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-slate-800 text-slate-600 border border-slate-700"
                    }`}
                  >
                    {ach.isUnlocked ? (
                      <HabitIcon name={ach.icon} className="w-6 h-6" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      ach.isUnlocked
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    +{ach.xpReward} XP
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{ach.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
              </div>

              {/* Progress Bar or Unlocked Tag */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {ach.isUnlocked ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Progress</span>
                      <span>
                        {ach.progress} / {ach.threshold}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${ach.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
