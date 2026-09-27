"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { useTheme } from "@/components/context/ThemeContext";
import { useToast } from "@/components/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { USER_PERSONAS } from "@/lib/constants";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [primaryType, setPrimaryType] = useState(user?.profile?.primaryType || "Student");
  const [remindersEnabled, setRemindersEnabled] = useState(user?.settings?.remindersEnabled ?? true);
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(user?.settings?.weeklySummaryEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setBio(user.profile?.bio || "");
      setPrimaryType(user.profile?.primaryType || "Student");
      setRemindersEnabled(user.settings?.remindersEnabled ?? true);
      setWeeklySummaryEnabled(user.settings?.weeklySummaryEnabled ?? true);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          bio,
          primaryType,
          remindersEnabled,
          weeklySummaryEnabled,
        }),
      });

      if (res.ok) {
        showToast({ title: "Profile settings saved successfully!", type: "success" });
        await refreshUser();
      }
    } catch (e) {
      console.error(e);
      showToast({ title: "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm("Are you sure you want to reset all demo habit data back to the 45-day initial state?")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/seed/reset", { method: "POST" });
      if (res.ok) {
        showToast({ title: "Demo data reset successfully!", type: "success" });
        await refreshUser();
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            Personalization & Preferences
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
          <User className="w-7 h-7 text-indigo-400" />
          My Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your account identity, persona archetype, notifications, and platform preferences.
        </p>
      </div>

      {/* Main Profile Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Identity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Identity Archetype
              </label>
              <select
                value={primaryType}
                onChange={(e) => setPrimaryType(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                {USER_PERSONAS.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Personal Growth Bio / Mission
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your mission or primary growth objective..."
              className="w-full p-2.5 text-xs rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Theme & Notifications */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Interface Theme
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    theme === "dark"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : "bg-slate-800/60 border-slate-700 text-slate-400"
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex-1 p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    theme === "light"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                      : "bg-slate-800/60 border-slate-700 text-slate-400"
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light Mode
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Notification Preferences
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remindersEnabled}
                    onChange={(e) => setRemindersEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  Enable Daily Habit Reminders
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklySummaryEnabled}
                    onChange={(e) => setWeeklySummaryEnabled(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  Enable Weekly AI Summary Notifications
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>

      {/* Demo Data Reset Box */}
      <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Reset Demo Dataset
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Restore the demo dataset with 45 continuous days of realistic logs and achievements.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetDemoData}
          isLoading={isResetting}
          className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
        >
          Reset Demo Data
        </Button>
      </div>
    </div>
  );
}
