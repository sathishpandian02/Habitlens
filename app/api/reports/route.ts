import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDashboardAnalytics, getFullAnalyticsLens } from "@/services/analyticsService";
import { getUserGamificationStats } from "@/services/gamificationService";
import { generateAIDiagnostics } from "@/services/aiService";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const reportType = searchParams.get("type") || "WEEKLY"; // DAILY, WEEKLY, MONTHLY, YEARLY, COMPLETE

    const analytics = await getDashboardAnalytics(user.id);
    const lens = await getFullAnalyticsLens(user.id, reportType === "YEARLY" ? "365d" : reportType === "MONTHLY" ? "30d" : "7d");
    const gamification = await getUserGamificationStats(user.id);
    const aiDiagnostics = await generateAIDiagnostics(user.id);

    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isArchived: false },
      include: { category: true, streaks: true },
    });

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
    });

    const reportData = {
      generatedAt: format(new Date(), "MMMM dd, yyyy • HH:mm"),
      reportType,
      user: {
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        persona: user.profile?.primaryType || "Personal Growth",
        joinedDate: format(user.createdAt, "MMMM yyyy"),
      },
      kpis: {
        habitLensScore: analytics.habitLensScore,
        weeklyScore: analytics.weeklyScore,
        prevWeeklyScore: analytics.prevWeeklyScore,
        wowImprovement: analytics.wowDifference,
        monthlyScore: analytics.monthlyScore,
        recoveryScore: analytics.recoveryScore,
        level: gamification.level,
        totalXp: gamification.totalXp,
        currentStreak: gamification.maxCurrentStreak,
        bestStreak: gamification.maxBestStreak,
      },
      habits: habits.map((h) => ({
        name: h.name,
        category: h.category?.name || "General",
        frequency: h.frequencyType,
        goal: `${h.goalTarget} ${h.goalUnit}`,
        currentStreak: h.streaks[0]?.currentStreak || 0,
        consistencyScore: h.streaks[0]?.consistencyScore || 0,
      })),
      habitHealthList: analytics.habitHealthList,
      aiDiagnostics: {
        insight: aiDiagnostics.insight,
        recommendedAction: aiDiagnostics.recommendedAction,
        weeklyPlan: aiDiagnostics.weeklyPlan,
      },
      goals: goals.map((g) => ({
        title: g.title,
        category: g.category,
        progress: g.progressPercentage,
        status: g.status,
      })),
      personalBests: lens.personalBests,
    };

    return NextResponse.json({ report: reportData });
  } catch (error: any) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Failed to generate report data." }, { status: 500 });
  }
}
