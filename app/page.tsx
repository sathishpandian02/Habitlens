"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Bot,
  Flame,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Target,
  Users,
  Compass,
  Play,
  Star,
} from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const { loginDemo, loading } = useAuth();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const router = useRouter();

  const handleTryDemo = async () => {
    setIsDemoLoading(true);
    const success = await loginDemo();
    if (success) {
      router.push("/dashboard");
    }
    setIsDemoLoading(false);
  };

  const features = [
    {
      icon: BarChart3,
      title: "Multi-Dimensional Analytics Lens",
      description: "Understand the true story behind your consistency with Week-over-Week comparisons, 365-day heatmaps, and category distribution.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: Bot,
      title: "Contextual AI Coach",
      description: "Not a generic chatbot. Our AI diagnoses your exact habit logs to generate strategic actions, 7-day personalized blueprints, and root-cause solutions.",
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: Flame,
      title: "Forgiving Gamification & Streaks",
      description: "Earn XP, unlock achievement badges, and climb levels with a resilient streak system that rewards consistency over punishment.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Target,
      title: "Goal → Habit Hierarchy",
      description: "Connect high-level aspirations to daily micro-actions with automatic weighted progress calculation and milestone projections.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Compass,
      title: "Daily Reflection & Energy Analysis",
      description: "Correlate your daily moods and energy levels with habit execution to discover your peak productivity windows.",
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      icon: FileText,
      title: "Executive Growth Dossier (PDF)",
      description: "Export high-resolution, presentation-ready PDF reports summarizing your achievements, habit health, and AI diagnostics.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  const steps = [
    { step: "01", title: "Select Your Persona", desc: "Choose from Student, Athlete, Professional, or Personal Growth to get curated starter habits." },
    { step: "02", title: "Track Daily Actions", desc: "Log scheduled habits effortlessly with instant circular scoring and micro-feedback." },
    { step: "03", title: "Analyze The Patterns", desc: "Discover what works through interactive charts, habit health metrics, and WoW trends." },
    { step: "04", title: "Improve with AI Coaching", desc: "Receive targeted guidance to conquer your weak spots and achieve compounding growth." },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-16 py-4 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Habit<span className="text-indigo-400">Lens</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTryDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-400" />
            Try Demo
          </button>
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-16 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          The AI-Powered Habit & Personal Growth Platform
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Build Better Habits. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            See Real Measurable Progress.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          HabitLens transforms everyday actions into deep behavioral insights, personalized AI coaching, and sustainable consistency.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleTryDemo}
            disabled={isDemoLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-white" />
            Explore Live Demo (1-Click)
          </button>
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-base border border-slate-700 transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </Link>
        </div>

        {/* Value Props Strip */}
        <div className="mt-14 pt-10 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Hardcoded Mock Data
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Contextual AI Diagnostic Coach
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" /> Week-over-Week Root Cause Analysis
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" /> Executive PDF Dossier Export
          </span>
        </div>
      </section>

      {/* Core Philosophy Section: Track -> Analyze -> Understand -> Improve -> Repeat */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            The HabitLens Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Track → Analyze → Understand → Improve → Repeat
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Most trackers stop at a checklist. HabitLens closes the feedback loop with behavioral intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all backdrop-blur-md relative group"
            >
              <span className="text-3xl font-black text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors">
                {s.step}
              </span>
              <h3 className="text-base font-bold text-white mt-2 mb-2">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 px-6 lg:px-16 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Engineered for Serious Personal Excellence
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Every feature is designed to eliminate guesswork and turn small daily actions into massive long-term momentum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all duration-200 backdrop-blur-md"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-5 ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 px-6 lg:px-16 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 blur-[90px] rounded-full pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Your Better Version Starts Today.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mt-4 leading-relaxed">
            Experience the commercial-grade habit intelligence platform designed to unlock your highest potential.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleTryDemo}
              disabled={isDemoLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all"
            >
              Launch Live Demo Environment
            </button>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 HabitLens Platform • AI-Powered Habit & Personal Growth Intelligence</p>
        <p className="mt-1 text-slate-600">&ldquo;See Your Habits. Understand Your Progress. Become Better.&rdquo;</p>
      </footer>
    </div>
  );
}
