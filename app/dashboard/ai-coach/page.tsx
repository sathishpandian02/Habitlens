"use client";

import React from "react";
import { AICoachChat } from "@/components/ai/AICoachChat";

export default function AICoachPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Clean Minimal Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          AI Coach
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Your personal habit &amp; growth assistant
        </p>
      </div>

      {/* Spacious Clean Chat Centerpiece */}
      <AICoachChat />
    </div>
  );
}
