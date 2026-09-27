"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Bot,
  Target,
  ListTodo,
  Flame,
  Calendar as CalendarIcon,
  Trophy,
  Timer,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  const navSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Today's Habits", href: "/dashboard#today-habits", icon: CheckCircle2 },
        { label: "Analytics Lens", href: "/dashboard/analytics", icon: BarChart3, badge: "AI" },
        { label: "AI Coach", href: "/dashboard/ai-coach", icon: Bot, highlight: true },
      ],
    },
    {
      title: "Planning",
      items: [
        { label: "Goals", href: "/dashboard/goals", icon: Target },
        { label: "Manage Habits", href: "/dashboard/habits", icon: ListTodo },
        { label: "Challenges", href: "/dashboard/challenges", icon: Flame },
      ],
    },
    {
      title: "Insights",
      items: [
        { label: "Calendar", href: "/dashboard/calendar", icon: CalendarIcon },
        { label: "Achievements", href: "/dashboard/achievements", icon: Trophy },
        { label: "Focus Mode", href: "/dashboard/focus", icon: Timer },
      ],
    },
    {
      title: "Reports & Data",
      items: [
        { label: "Data & Reports", href: "/dashboard/reports", icon: FileText },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Profile & Settings", href: "/dashboard/profile", icon: User },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-slate-900/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <a href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                Habit<span className="text-indigo-400">Lens</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Intelligence
              </span>
            </div>
          )}
        </a>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                {section.title}
              </h4>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <a
                    key={itemIdx}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : item.highlight
                        ? "text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : item.highlight ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                    {!collapsed && (
                      <span className="flex-1 truncate tracking-tight">{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Mini Bar / Logout */}
      <div className="p-3 border-t border-slate-800/80">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs flex-shrink-0">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || "HabitLens User"}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.profile?.primaryType || "Personal Growth"}</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            title="Log out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
