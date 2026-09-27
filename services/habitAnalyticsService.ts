import prisma from "@/lib/prisma";
import { format, subDays, eachDayOfInterval } from "date-fns";

export interface HabitItemMetric {
  habitId: string;
  name: string;
  category: string;
  completionRate: number;
  totalLogs: number;
  completedLogs: number;
  missedLogs: number;
  skippedLogs: number;
  currentStreak: number;
  bestStreak: number;
  priority: string;
  status: "STRONG" | "MODERATE" | "WEAK";
  recommendation?: string;
}

export interface HabitUserContext {
  user: {
    id: string;
    fullName: string;
    username: string;
    archetype: string;
    level: number;
    totalXp: number;
  };
  overview: {
    analyzedDays: number;
    totalScheduled: number;
    totalCompleted: number;
    totalMissed: number;
    totalSkipped: number;
    overallCompletionRate: number;
    currentWeekRate: number;
    previousWeekRate: number;
    trendPercentage: number;
    trendDirection: "IMPROVING" | "DECLINING" | "STEADY";
    trendDescription: string;
  };
  strengths: HabitItemMetric[];
  moderate: HabitItemMetric[];
  weaknesses: HabitItemMetric[];
  goals: Array<{
    id: string;
    title: string;
    category: string;
    progressPercentage: number;
    status: string;
  }>;
  recentReflections: Array<{
    date: string;
    mood: string;
    energyLevel: string;
    notes: string | null;
  }>;
  summaryText: string;
}

/**
 * Aggregates live user habit performance data for the past 14-30 days from Prisma.
 * Safe against division-by-zero, empty states, and missing records.
 */
export async function getUserHabitAnalytics(
  userId: string,
  daysBack: number = 30
): Promise<HabitUserContext> {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const startDateStr = format(subDays(today, daysBack - 1), "yyyy-MM-dd");

  // 1. Fetch user profile, gamification XP, and active habits
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      habits: {
        where: { isArchived: false },
        include: {
          category: true,
          streaks: true,
          logs: {
            where: {
              date: {
                gte: startDateStr,
                lte: todayStr,
              },
            },
            orderBy: { date: "asc" },
          },
        },
      },
      goals: {
        where: { status: "ACTIVE" },
        take: 5,
      },
      dailyReflections: {
        where: {
          date: {
            gte: format(subDays(today, 7), "yyyy-MM-dd"),
          },
        },
        orderBy: { date: "desc" },
        take: 5,
      },
      xpTransactions: {
        select: { amount: true },
      },
    },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found.`);
  }

  // Calculate user total XP & level
  const totalXp = user.xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  let level = 1;
  let remainingXp = totalXp;
  while (true) {
    const requiredForNext = level * 250;
    if (remainingXp < requiredForNext) break;
    remainingXp -= requiredForNext;
    level++;
  }

  // 2. Week-over-Week date ranges
  const currentWeekDates = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  }).map((d) => format(d, "yyyy-MM-dd"));

  const previousWeekDates = eachDayOfInterval({
    start: subDays(today, 13),
    end: subDays(today, 7),
  }).map((d) => format(d, "yyyy-MM-dd"));

  let currentWeekScheduled = 0;
  let currentWeekCompleted = 0;
  let prevWeekScheduled = 0;
  let prevWeekCompleted = 0;

  let totalScheduled = 0;
  let totalCompleted = 0;
  let totalMissed = 0;
  let totalSkipped = 0;

  const habitMetricsList: HabitItemMetric[] = [];

  for (const habit of user.habits) {
    const logs = habit.logs || [];
    const scheduledCount = logs.length;
    const completedCount = logs.filter((l) => l.status === "COMPLETED").length;
    const missedCount = logs.filter((l) => l.status === "MISSED").length;
    const skippedCount = logs.filter((l) => l.status === "SKIPPED").length;

    totalScheduled += scheduledCount;
    totalCompleted += completedCount;
    totalMissed += missedCount;
    totalSkipped += skippedCount;

    // Week-over-week accumulation
    for (const log of logs) {
      if (currentWeekDates.includes(log.date)) {
        currentWeekScheduled++;
        if (log.status === "COMPLETED") currentWeekCompleted++;
      } else if (previousWeekDates.includes(log.date)) {
        prevWeekScheduled++;
        if (log.status === "COMPLETED") prevWeekCompleted++;
      }
    }

    // Completion percentage with division-by-zero check
    const rate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;
    const streak = habit.streaks[0]?.currentStreak || 0;
    const bestStreak = habit.streaks[0]?.bestStreak || streak;

    let status: HabitItemMetric["status"] = "MODERATE";
    let recommendation = "";

    if (rate >= 80) {
      status = "STRONG";
      recommendation = `Excellent consistency (${rate}%). Keep momentum steady.`;
    } else if (rate < 50 || missedCount >= 5) {
      status = "WEAK";
      recommendation = `Adherence at ${rate}% with ${missedCount} missed sessions. Scale friction down or anchor earlier in the day.`;
    } else {
      status = "MODERATE";
      recommendation = `Consistent baseline (${rate}%). Stack with high-leverage anchor habits.`;
    }

    habitMetricsList.push({
      habitId: habit.id,
      name: habit.name,
      category: habit.category?.name || "General",
      completionRate: rate,
      totalLogs: scheduledCount,
      completedLogs: completedCount,
      missedLogs: missedCount,
      skippedLogs: skippedCount,
      currentStreak: streak,
      bestStreak: bestStreak,
      priority: habit.priority,
      status,
      recommendation,
    });
  }

  // 3. Classify into Strong, Moderate, and Weak
  const strengths = habitMetricsList
    .filter((h) => h.status === "STRONG")
    .sort((a, b) => b.completionRate - a.completionRate);

  const moderate = habitMetricsList
    .filter((h) => h.status === "MODERATE")
    .sort((a, b) => b.completionRate - a.completionRate);

  const weaknesses = habitMetricsList
    .filter((h) => h.status === "WEAK")
    .sort((a, b) => a.completionRate - b.completionRate);

  // 4. Calculate overall rates and trend direction
  const overallRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
  const currentWeekRate = currentWeekScheduled > 0 ? Math.round((currentWeekCompleted / currentWeekScheduled) * 100) : overallRate;
  const prevWeekRate = prevWeekScheduled > 0 ? Math.round((prevWeekCompleted / prevWeekScheduled) * 100) : 0;
  const trendPercentage = currentWeekRate - prevWeekRate;

  let trendDirection: "IMPROVING" | "DECLINING" | "STEADY" = "STEADY";
  let trendDescription = "Consistency is holding steady compared to the previous week.";

  if (prevWeekScheduled === 0) {
    trendDirection = "STEADY";
    trendDescription = "Establishing baseline performance for the first recorded week.";
  } else if (trendPercentage > 3) {
    trendDirection = "IMPROVING";
    trendDescription = `Consistency increased by +${trendPercentage}% compared to last week.`;
  } else if (trendPercentage < -3) {
    trendDirection = "DECLINING";
    trendDescription = `Consistency dropped by ${Math.abs(trendPercentage)}% compared to last week.`;
  }

  // 5. Goals summary
  const goals = user.goals.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    progressPercentage: Math.round(g.progressPercentage),
    status: g.status,
  }));

  // 6. Recent reflections
  const recentReflections = user.dailyReflections.map((r) => ({
    date: r.date,
    mood: r.mood,
    energyLevel: r.energyLevel,
    notes: r.notes,
  }));

  // 7. Structured textual summary for system prompt injection
  const strongSummary = strengths.length > 0
    ? strengths.map((s) => `${s.name} (${s.completionRate}%, ${s.currentStreak}d streak)`).join(", ")
    : "None currently >= 80%";

  const weakSummary = weaknesses.length > 0
    ? weaknesses.map((w) => `${w.name} (${w.completionRate}%, ${w.missedLogs} missed)`).join(", ")
    : "None currently below 50%";

  const goalsSummary = goals.length > 0
    ? goals.map((g) => `"${g.title}" (${g.progressPercentage}%)`).join(", ")
    : "No active goals logged";

  const summaryText = `User: ${user.fullName || user.username} | Archetype: ${user.profile?.primaryType || "Personal Growth"} | Level: ${level} (${totalXp} XP)
Past ${daysBack} Days: ${totalCompleted}/${totalScheduled} completed (${overallRate}% adherence).
Current Week: ${currentWeekRate}% vs Last Week: ${prevWeekRate}% (Trend: ${trendDirection} ${trendPercentage >= 0 ? `+${trendPercentage}%` : `${trendPercentage}%`}).
Strong Habits: ${strongSummary}
Weak/Struggling Habits: ${weakSummary}
Active Goals: ${goalsSummary}`;

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      archetype: user.profile?.primaryType || "Personal Growth",
      level,
      totalXp,
    },
    overview: {
      analyzedDays: daysBack,
      totalScheduled,
      totalCompleted,
      totalMissed,
      totalSkipped,
      overallCompletionRate: overallRate,
      currentWeekRate,
      previousWeekRate: prevWeekRate,
      trendPercentage,
      trendDirection,
      trendDescription,
    },
    strengths,
    moderate,
    weaknesses,
    goals,
    recentReflections,
    summaryText,
  };
}
