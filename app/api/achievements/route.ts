import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allAchievements = await prisma.achievement.findMany({
      orderBy: { xpReward: "asc" },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
    });

    const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    const formatted = allAchievements.map((ach) => {
      const userRecord = userAchMap.get(ach.id);
      const isUnlocked = !!userRecord?.unlockedAt;
      const progress = userRecord ? userRecord.progress : 0;
      const progressPercent = Math.min(100, Math.round((progress / ach.threshold) * 100));

      return {
        id: ach.id,
        code: ach.code,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        icon: ach.icon,
        xpReward: ach.xpReward,
        threshold: ach.threshold,
        isUnlocked,
        unlockedAt: userRecord?.unlockedAt || null,
        progress,
        progressPercent,
      };
    });

    return NextResponse.json({ achievements: formatted });
  } catch (error: any) {
    console.error("Achievements GET error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements." }, { status: 500 });
  }
}
