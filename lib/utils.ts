import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatPercentage(val: number): string {
  if (isNaN(val) || !isFinite(val)) return "0%";
  return `${Math.round(val)}%`;
}

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  let timeGreeting = "Good day";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 18) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";

  const cleanName = name?.trim();
  return cleanName ? `${timeGreeting}, ${cleanName} 👋` : `${timeGreeting} 👋`;
}

export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
  // Level threshold formula: Level L requires 200 * L XP
  // Total XP for Level L: 100 * L * (L - 1)
  let level = 1;
  while (true) {
    const requiredForNext = level * 250;
    if (xp < requiredForNext) {
      return {
        level,
        currentXp: xp,
        nextLevelXp: requiredForNext,
        progress: Math.min(100, Math.round((xp / requiredForNext) * 100)),
      };
    }
    xp -= requiredForNext;
    level++;
  }
}
