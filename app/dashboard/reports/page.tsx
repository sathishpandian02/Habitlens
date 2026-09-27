"use client";

import React, { useState, useEffect } from "react";
import { FileText, Download, Sparkles, Filter, Calendar } from "lucide-react";
import { PdfReportViewer } from "@/components/reports/PdfReportViewer";
import { Button } from "@/components/ui/Button";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>("WEEKLY");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${reportType}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data.report);
      }
    } catch (e) {
      console.error("Fetch report error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const reportTypes = [
    { id: "WEEKLY", label: "Weekly Growth Report" },
    { id: "MONTHLY", label: "Monthly Performance Report" },
    { id: "YEARLY", label: "Annual Dossier" },
    { id: "COMPLETE", label: "Full Executive Intelligence Dossier" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              Executive Presentation & Data Export
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-400" />
            Data & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate and export presentation-quality PDF reports summarizing your consistency, AI coaching, and habit metrics.
          </p>
        </div>

        {/* Report Type Selector */}
        <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1 rounded-2xl overflow-x-auto max-w-full">
          {reportTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setReportType(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                reportType === t.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live PDF Viewer and Downloader */}
      {loading || !reportData ? (
        <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-4 animate-pulse">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Compiling comprehensive growth dossier...</p>
        </div>
      ) : (
        <PdfReportViewer reportData={reportData} />
      )}
    </div>
  );
}
