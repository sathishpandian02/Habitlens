"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface WeekComparisonBarChartProps {
  data: Array<{
    day: string;
    shortDay: string;
    completionRate: number;
    totalCompleted: number;
  }>;
}

export function WeekComparisonBarChart({ data }: WeekComparisonBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        No weekly data available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="shortDay"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs backdrop-blur-md">
                    <p className="font-bold text-white mb-1">{item.day}</p>
                    <p className="text-emerald-400 font-semibold">
                      Consistency: <span className="text-white">{item.completionRate}%</span>
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {item.totalCompleted} habit sessions logged
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="completionRate" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => {
              let color = "#6366f1";
              if (entry.completionRate >= 85) color = "#10b981";
              else if (entry.completionRate >= 65) color = "#6366f1";
              else if (entry.completionRate >= 40) color = "#f59e0b";
              else color = "#f43f5e";

              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
