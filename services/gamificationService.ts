import prisma from "@/lib/prisma";
import { calculateLevel } from "@/lib/utils";

export async function addXP(userId: string, amount: number, reason: string, sourceId?: string) {
  // Create XP Transaction
  const tx = await prisma.xPTransaction.create({
    data: {
      userId,
      amount,
      reason,
      sourceId,
    },
  });

  return tx;
}

export async function getUserGamificationStats(userId: string) {
  // Sum total XP
  const xpAggregate = await prisma.xPTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  const totalXp = xpAggregate._sum.amount || 0;
  const levelInfo = calculateLevel(totalXp);

  // Get unlocked achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  });

  // Calculate overall streak
  const streaks = await prisma.streak.findMany({
    where: { userId },
  });

  const maxCurrentStreak = streaks.reduce((max, s) => Math.max(max, s.currentStreak), 0);
  const maxBestStreak = streaks.reduce((max, s) => Math.max(max, s.bestStreak), 0);

  return {
    totalXp,
    level: levelInfo.level,
    currentXpInLevel: levelInfo.currentXp,
    nextLevelXp: levelInfo.nextLevelXp,
    progressToNextLevel: levelInfo.progress,
    unlockedBadgesCount: userAchievements.filter((ua) => ua.unlockedAt !== null).length,
    maxCurrentStreak,
    maxBestStreak,
    userAchievements,
  };
}

export async function checkAndUnlockAchievements(userId: string) {
  // Ensure default achievements exist
  const allAchievements = await prisma.achievement.findMany();

  // Count total completed habits for user
  const totalCompletedCount = await prisma.habitLog.count({
    where: { userId, status: "COMPLETED" },
  });

  // Longest streak
  const streaks = await prisma.streak.findMany({ where: { userId } });
  const maxStreak = streaks.reduce((max, s) => Math.max(max, s.currentStreak), 0);

  // Reading habit count
  const readingHabits = await prisma.habit.findMany({
    where: {
      userId,
      OR: [{ name: { contains: "Read" } }, { category: { name: { contains: "Growth" } } }],
    },
    select: { id: true },
  });
  const readingIds = readingHabits.map((h) => h.id);
  const totalReadingCompleted = await prisma.habitLog.count({
    where: {
      userId,
      habitId: { in: readingIds },
      status: "COMPLETED",
    },
  });

  const newlyUnlocked: Array<{ title: string; xpReward: number; icon: string }> = [];

  for (const ach of allAchievements) {
    let qualifies = false;
    let currentProgress = 0;

    switch (ach.conditionType) {
      case "FIRST_HABIT":
        qualifies = totalCompletedCount >= 1;
        currentProgress = Math.min(1, totalCompletedCount);
        break;
      case "STREAK_7":
        qualifies = maxStreak >= 7;
        currentProgress = Math.min(7, maxStreak);
        break;
      case "STREAK_30":
        qualifies = maxStreak >= 30;
        currentProgress = Math.min(30, maxStreak);
        break;
      case "TOTAL_50":
        qualifies = totalCompletedCount >= 50;
        currentProgress = Math.min(50, totalCompletedCount);
        break;
      case "READING_30":
        qualifies = totalReadingCompleted >= 30;
        currentProgress = Math.min(30, totalReadingCompleted);
        break;
      case "PERFECT_DAY":
        // Handled directly on perfect day
        qualifies = totalCompletedCount >= 5;
        currentProgress = 1;
        break;
      default:
        break;
    }

    const existingUserAch = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: ach.id,
        },
      },
    });

    if (!existingUserAch) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
          unlockedAt: qualifies ? new Date() : null,
          progress: currentProgress,
        },
      });

      if (qualifies) {
        await addXP(userId, ach.xpReward, `Unlocked Badge: ${ach.title}`, ach.id);
        await prisma.notification.create({
          data: {
            userId,
            type: "ACHIEVEMENT",
            title: `🏆 New Badge Unlocked: ${ach.title}!`,
            message: `${ach.description} (+${ach.xpReward} XP)`,
            link: "/dashboard/achievements",
          },
        });
        newlyUnlocked.push({ title: ach.title, xpReward: ach.xpReward, icon: ach.icon });
      }
    } else if (!existingUserAch.unlockedAt && qualifies) {
      await prisma.userAchievement.update({
        where: { id: existingUserAch.id },
        data: {
          unlockedAt: new Date(),
          progress: currentProgress,
        },
      });

      await addXP(userId, ach.xpReward, `Unlocked Badge: ${ach.title}`, ach.id);
      await prisma.notification.create({
        data: {
          userId,
          type: "ACHIEVEMENT",
          title: `🏆 New Badge Unlocked: ${ach.title}!`,
          message: `${ach.description} (+${ach.xpReward} XP)`,
          link: "/dashboard/achievements",
        },
      });
      newlyUnlocked.push({ title: ach.title, xpReward: ach.xpReward, icon: ach.icon });
    } else if (existingUserAch) {
      await prisma.userAchievement.update({
        where: { id: existingUserAch.id },
        data: { progress: currentProgress },
      });
    }
  }

  return newlyUnlocked;
}
