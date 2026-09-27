"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Download, FileText, Sparkles, CheckCircle2, Trophy, Flame } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReportData {
  generatedAt: string;
  reportType: string;
  user: {
    fullName: string;
    username: string;
    email: string;
    persona: string;
    joinedDate: string;
  };
  kpis: {
    habitLensScore: number;
    weeklyScore: number;
    prevWeeklyScore: number;
    wowImprovement: number;
    monthlyScore: number;
    recoveryScore: number;
    level: number;
    totalXp: number;
    currentStreak: number;
    bestStreak: number;
  };
  habits: Array<{
    name: string;
    category: string;
    frequency: string;
    goal: string;
    currentStreak: number;
    consistencyScore: number;
  }>;
  habitHealthList: Array<{
    habitName: string;
    category: string;
    completionRate: number;
    statusText: string;
    explanation: string;
  }>;
  aiDiagnostics: {
    insight: string;
    recommendedAction: string;
    weeklyPlan: Array<{ day: string; habit: string; focusNote: string }>;
  };
  goals: Array<{
    title: string;
    category: string;
    progress: number;
    status: string;
  }>;
  personalBests: {
    bestDayScore: string;
    longestStreak: string;
    totalCompletedHabits: number;
    bestMonthlyScore: string;
  };
}

interface PdfReportViewerProps {
  reportData: ReportData;
}

export function PdfReportViewer({ reportData }: PdfReportViewerProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0B0F19",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HabitLens_${reportData.reportType}_Report_${reportData.user.username}.pdf`);
    } catch (err) {
      console.error("PDF Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
        <div>
          <h4 className="text-sm font-bold text-white">Export Official Growth Dossier</h4>
          <p className="text-xs text-slate-400">
            Presentation-ready PDF report including analytics, AI coaching, and habit metrics.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleDownloadPdf} isLoading={isExporting}>
          <Download className="w-4 h-4 mr-1.5" />
          Download PDF Report
        </Button>
      </div>

      {/* Printable Report Canvas Container */}
      <div
        ref={reportRef}
        className="p-8 sm:p-12 rounded-3xl bg-[#0B0F19] text-white border border-slate-800 shadow-2xl space-y-8 font-sans"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Habit<span className="text-indigo-400">Lens</span>
                </h1>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Personal Growth & Habit Intelligence Platform
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Generated: <strong className="text-slate-300">{reportData.generatedAt}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              {reportData.reportType} PERFORMANCE DOSSIER
            </span>
            <div className="mt-2 text-xs text-slate-400">
              <p className="font-semibold text-white">{reportData.user.fullName}</p>
              <p className="capitalize">{reportData.user.persona} • Member since {reportData.user.joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Top KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase">HabitLens Score</p>
            <p className="text-2xl font-black text-indigo-400 mt-1">{reportData.kpis.habitLensScore}/100</p>
            <p className="text-[10px] text-slate-400 mt-1">Composite Adherence</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Weekly Score</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{reportData.kpis.weeklyScore}%</p>
            <p className="text-[10px] text-slate-400 mt-1">
              {reportData.kpis.wowImprovement >= 0 ? `+${reportData.kpis.wowImprovement}%` : `${reportData.kpis.wowImprovement}%`} vs last week
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Active Streak</p>
            <p className="text-2xl font-black text-amber-400 mt-1">🔥 {reportData.kpis.currentStreak} Days</p>
            <p className="text-[10px] text-slate-400 mt-1">Best: {reportData.kpis.bestStreak} days</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Total XP / Level</p>
            <p className="text-2xl font-black text-purple-400 mt-1">Level {reportData.kpis.level}</p>
            <p className="text-[10px] text-slate-400 mt-1">{reportData.kpis.totalXp} XP Accumulated</p>
          </div>
        </div>

        {/* AI Diagnostics & Strategy */}
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Coach Executive Diagnostic
          </div>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {reportData.aiDiagnostics.insight}
          </p>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-slate-200">
            <strong className="text-emerald-400 uppercase tracking-wide">Key Recommendation: </strong>
            {reportData.aiDiagnostics.recommendedAction}
          </div>
        </div>

        {/* Habit Health Breakdown Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
            Individual Habit Health Matrix
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Habit Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Adherence %</th>
                  <th className="p-3">Health Status</th>
                  <th className="p-3">Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {reportData.habitHealthList.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-white">{h.habitName}</td>
                    <td className="p-3 text-slate-400">{h.category}</td>
                    <td className="p-3 font-semibold text-indigo-400">{h.completionRate}%</td>
                    <td className="p-3 font-bold text-slate-300">{h.statusText}</td>
                    <td className="p-3 text-slate-400 text-[11px]">{h.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Goals Progress */}
        {reportData.goals.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              Strategic Long-Term Goals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reportData.goals.map((g, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-white">{g.title}</span>
                    <span className="text-indigo-400">{g.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <p>HabitLens Intelligence Dossier • Confidential Personal Analytics</p>
          <p>&ldquo;See Your Habits. Understand Your Progress. Become Better.&rdquo;</p>
        </div>
      </div>
    </div>
  );
}
