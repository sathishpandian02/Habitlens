"use client";

import React, { useState } from "react";

interface HeatmapDay {
  date: string;
  count: number;
  rate: number;
  level: number; // 0, 1, 2, 3, 4
}

interface HabitHeatmapProps {
  data: HeatmapDay[];
}

export function HabitHeatmap({ data }: HabitHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-400">
        No consistency data recorded
      </div>
    );
  }

  // Level colors
  const levelColors = [
    "bg-slate-800/60 border-slate-700/30",
    "bg-indigo-900/60 border-indigo-700/40 text-indigo-200",
    "bg-indigo-700 border-indigo-600 text-indigo-100",
    "bg-indigo-500 border-indigo-400 text-white",
    "bg-emerald-500 border-emerald-400 text-white shadow-sm shadow-emerald-500/20",
  ];

  // Group into weeks of 7 days
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  data.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="space-y-3">
      {/* Scrollable Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max p-1">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer hover:scale-125 hover:z-10 ${
                    levelColors[day.level] || levelColors[0]
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Legend / Tooltip Info */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="min-h-5 flex items-center">
          {hoveredDay ? (
            <p className="text-slate-200 font-medium">
              <span className="text-indigo-400 font-bold">{hoveredDay.date}</span>:{" "}
              {hoveredDay.count} habits completed ({hoveredDay.rate}% score)
            </p>
          ) : (
            <p className="text-slate-500">Hover over any day to inspect historical consistency</p>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Less</span>
          {levelColors.map((cls, idx) => (
            <div key={idx} className={`w-3 h-3 rounded-sm border ${cls}`} />
          ))}
          <span className="text-[11px] text-slate-500">More</span>
        </div>
      </div>
    </div>
  );
}
