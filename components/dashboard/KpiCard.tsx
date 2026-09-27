import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  highlight?: boolean;
  className?: string;
}

export function KpiCard({ title, value, subtitle, icon, trend, highlight = false, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 border transition-all duration-200",
        highlight
          ? "bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-900/80 border-indigo-500/30 shadow-lg shadow-indigo-500/5"
          : "bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-flex items-center font-bold px-1.5 py-0.5 rounded-md text-[11px]",
                  trend.direction === "up"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : trend.direction === "down"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    : "bg-slate-700/20 text-slate-400"
                )}
              >
                {trend.direction === "up" ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : trend.direction === "down" ? (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <Minus className="w-3 h-3 mr-0.5" />
                )}
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{trend.label || "vs last period"}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
