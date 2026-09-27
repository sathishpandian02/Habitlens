"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Flame,
  Sparkles,
  Sun,
  Moon,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { useTheme } from "@/components/context/ThemeContext";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export function TopNav() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const streak = user?.gamification?.maxCurrentStreak ?? 12;
  const xp = user?.gamification?.totalXp ?? 1340;
  const level = user?.gamification?.level ?? 6;
  const xpProgress = user?.gamification?.progressToNextLevel ?? 68;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-slate-900/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/80">
      {/* Search Input */}
      <div className="relative max-w-md w-full hidden sm:block">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search habits, categories, insights, goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-800/60 dark:bg-slate-900/60 border border-slate-700/60 focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Action Chips & Widgets */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Streak Indicator */}
        <a
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm shadow-amber-500/5 group"
          title={`${streak} days streak`}
        >
          <Flame className="w-4 h-4 text-amber-500 animate-flame" />
          <span className="text-xs font-bold tracking-tight">{streak} Days</span>
        </a>

        {/* Level & XP Chip */}
        <a
          href="/dashboard/achievements"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 transition-all"
          title={`Level ${level} • ${xp} Total XP`}
        >
          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white">
            {level}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold leading-none">{xp} XP</span>
            <div className="w-12 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </a>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <a
                      key={n.id}
                      href={n.link || "#"}
                      onClick={() => setShowNotifs(false)}
                      className={`block p-3.5 hover:bg-slate-800/40 transition-colors ${
                        !n.isRead ? "bg-indigo-950/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-semibold text-white">{n.title}</h5>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <a
          href="/dashboard/profile"
          className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="text-xs font-medium text-slate-200 hidden md:block group-hover:text-white">
            {user?.fullName?.split(" ")[0] || user?.username || "Profile"}
          </span>
        </a>
      </div>
    </header>
  );
}
