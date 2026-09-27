import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getTodayDateString, getGreeting } from "@/lib/utils";
import { getDailyScore } from "@/services/habitService";
import { getDashboardAnalytics } from "@/services/analyticsService";
import { getUserGamificationStats } from "@/services/gamificationService";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = getTodayDateString();
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();

    // 1. Daily Score calculation
    const dailyScore = await getDailyScore(user.id, todayStr);

    // 2. Dashboard Analytics (Weekly score, WoW improvement, monthly, habitLensScore, recoveryScore)
    const analytics = await getDashboardAnalytics(user.id);

    // 3. Gamification stats (XP, Level, Badges)
    const gamification = await getUserGamificationStats(user.id);

    // 4. Fetch all active habits with today's log and streaks
    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
        isPaused: false,
        isArchived: false,
      },
      include: {
        category: true,
        streaks: true,
        logs: {
          where: { date: todayStr },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    const todayHabits = habits.map((h) => {
      const log = h.logs[0];
      const status = log ? log.status : "PENDING";
      const streak = h.streaks[0]?.currentStreak || 0;
      const bestStreak = h.streaks[0]?.bestStreak || streak;

      // Check if scheduled today
      let isScheduledToday = true;
      if (h.frequencyType !== "DAILY") {
        try {
          const days: number[] = JSON.parse(h.scheduledDays || "[0,1,2,3,4,5,6]");
          isScheduledToday = days.includes(dayOfWeek);
        } catch {
          isScheduledToday = true;
        }
      }

      return {
        id: h.id,
        name: h.name,
        description: h.description,
        icon: h.icon,
        color: h.color,
        category: h.category?.name || "General",
        categoryColor: h.category?.color || h.color,
        goalTarget: h.goalTarget,
        goalUnit: h.goalUnit,
        reminderTime: h.reminderTime,
        priority: h.priority,
        difficulty: h.difficulty,
        status,
        isScheduledToday,
        currentStreak: streak,
        bestStreak,
        notes: log?.notes || "",
        completedAt: log?.completedAt || null,
      };
    });

    // 5. Today's Reflection
    const todayReflection = await prisma.dailyReflection.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayStr,
        },
      },
    });

    // 6. Dynamic Smart Home Motivational Banner
    let bannerTitle = "";
    let bannerMessage = "";
    let bannerType: "success" | "warning" | "info" = "info";

    if (dailyScore.percentage === 100 && dailyScore.totalScheduled > 0) {
      bannerTitle = "🔥 Perfect Day Achieved!";
      bannerMessage = "Incredible work. You've conquered every single habit on your schedule today.";
      bannerType = "success";
    } else if (analytics.weeklyScore >= 80) {
      bannerTitle = "🔥 You're having a dominant week!";
      bannerMessage = `Your consistency is at ${analytics.weeklyScore}% (${analytics.wowDifference >= 0 ? `+${analytics.wowDifference}%` : `${analytics.wowDifference}%`} vs last week). Keep this rhythm!`;
      bannerType = "success";
    } else if (analytics.weeklyScore >= 60) {
      bannerTitle = "⚡ Steady Momentum";
      bannerMessage = "You're building solid ground. Complete your remaining evening habits to push past 80%.";
      bannerType = "info";
    } else {
      bannerTitle = "🎯 Reclaim Your Day";
      bannerMessage = "Let's simplify today. Focus on your top 2 anchor habits first to lock in a win.";
      bannerType = "warning";
    }

    // Persona subtitle
    const personaType = user.profile?.primaryType || "Personal Growth";
    const displayName = user.fullName?.trim() || user.username?.trim() || "";
    const greeting = getGreeting(displayName);

    return NextResponse.json({
      greeting,
      personaType,
      todayScore: dailyScore.percentage,
      dailyScoreBreakdown: dailyScore,
      currentStreak: gamification.maxCurrentStreak,
      weeklyScore: analytics.weeklyScore,
      prevWeeklyScore: analytics.prevWeeklyScore,
      wowDifference: analytics.wowDifference,
      wowInterpretation: analytics.wowInterpretation,
      monthlyScore: analytics.monthlyScore,
      habitLensScore: analytics.habitLensScore,
      recoveryScore: analytics.recoveryScore,
      level: gamification.level,
      totalXp: gamification.totalXp,
      currentXpInLevel: gamification.currentXpInLevel,
      nextLevelXp: gamification.nextLevelXp,
      xpProgress: gamification.progressToNextLevel,
      unlockedBadgesCount: gamification.unlockedBadgesCount,
      todayHabits,
      todayReflection,
      banner: {
        title: bannerTitle,
        message: bannerMessage,
        type: bannerType,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard data." }, { status: 500 });
  }
}
