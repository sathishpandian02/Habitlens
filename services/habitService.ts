import prisma from "@/lib/prisma";
import { getTodayDateString } from "@/lib/utils";
import { addXP, checkAndUnlockAchievements } from "./gamificationService";

export interface DailyScoreResult {
  date: string;
  totalScheduled: number;
  completed: number;
  skipped: number;
  missed: number;
  pending: number;
  percentage: number;
  weightedScore?: number;
}

export async function getDailyScore(userId: string, dateStr: string = getTodayDateString()): Promise<DailyScoreResult> {
  const targetDate = new Date(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Fetch all active habits for user
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      isPaused: false,
      isArchived: false,
    },
    include: {
      logs: {
        where: { date: dateStr },
      },
    },
  });

  // Filter habits scheduled for this day
  const scheduledHabits = habits.filter((habit) => {
    if (habit.frequencyType === "DAILY") return true;
    try {
      const scheduledDays: number[] = JSON.parse(habit.scheduledDays || "[0,1,2,3,4,5,6]");
      return scheduledDays.includes(dayOfWeek);
    } catch {
      return true;
    }
  });

  if (scheduledHabits.length === 0) {
    return {
      date: dateStr,
      totalScheduled: 0,
      completed: 0,
      skipped: 0,
      missed: 0,
      pending: 0,
      percentage: 0,
    };
  }

  let completed = 0;
  let skipped = 0;
  let missed = 0;
  let pending = 0;

  scheduledHabits.forEach((habit) => {
    const log = habit.logs[0];
    const status = log ? log.status : "PENDING";
    if (status === "COMPLETED") completed++;
    else if (status === "SKIPPED") skipped++;
    else if (status === "MISSED") missed++;
    else pending++;
  });

  // Skipped habits do not penalize the completion denominator if excused
  // Formula: completed / (totalScheduled - skipped) if (totalScheduled - skipped) > 0 else (completed / totalScheduled)
  const effectiveTotal = Math.max(1, scheduledHabits.length - skipped);
  const percentage = Math.min(100, Math.round((completed / effectiveTotal) * 100));

  return {
    date: dateStr,
    totalScheduled: scheduledHabits.length,
    completed,
    skipped,
    missed,
    pending,
    percentage,
  };
}

export async function toggleHabitStatus(
  userId: string,
  habitId: string,
  targetStatus: "COMPLETED" | "SKIPPED" | "MISSED" | "PENDING",
  dateStr: string = getTodayDateString(),
  notes?: string
) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId, userId },
  });

  if (!habit) throw new Error("Habit not found");

  // Upsert the log
  const log = await prisma.habitLog.upsert({
    where: {
      habitId_date: {
        habitId,
        date: dateStr,
      },
    },
    create: {
      habitId,
      userId,
      date: dateStr,
      status: targetStatus,
      value: targetStatus === "COMPLETED" ? habit.goalTarget : 0,
      notes,
      completedAt: targetStatus === "COMPLETED" ? new Date() : null,
    },
    update: {
      status: targetStatus,
      value: targetStatus === "COMPLETED" ? habit.goalTarget : 0,
      notes: notes !== undefined ? notes : undefined,
      completedAt: targetStatus === "COMPLETED" ? new Date() : null,
    },
  });

  // Update streak
  const streakInfo = await updateHabitStreak(userId, habitId, dateStr);

  // If completed, award XP
  let xpAwarded = 0;
  if (targetStatus === "COMPLETED") {
    xpAwarded += 10;
    await addXP(userId, 10, `Completed habit: ${habit.name}`, habitId);

    // Check if user completed 100% of today's habits
    const dailyScore = await getDailyScore(userId, dateStr);
    if (dailyScore.percentage === 100 && dailyScore.totalScheduled > 0) {
      xpAwarded += 25;
      await addXP(userId, 25, "100% Perfect Day Bonus!", `perfect-day-${dateStr}`);
    }

    // Check achievements
    await checkAndUnlockAchievements(userId);
  }

  // Update goal progress if habit linked to goals
  await updateLinkedGoalsProgress(userId, habitId);

  return {
    log,
    streak: streakInfo,
    xpAwarded,
  };
}

export async function updateHabitStreak(userId: string, habitId: string, currentDateStr: string) {
  // Fetch all logs for this habit ordered by date descending
  const logs = await prisma.habitLog.findMany({
    where: { habitId, userId },
    orderBy: { date: "desc" },
    take: 90,
  });

  const logMap = new Map<string, string>();
  logs.forEach((l) => logMap.set(l.date, l.status));

  // Compute streak
  let currentStreak = 0;
  let checkDate = new Date(currentDateStr);

  // Check if today or yesterday was completed to count active streak
  let hasBroken = false;
  for (let i = 0; i < 90; i++) {
    const dStr = checkDate.toISOString().split("T")[0];
    const status = logMap.get(dStr);

    if (status === "COMPLETED") {
      currentStreak++;
    } else if (status === "SKIPPED") {
      // Skipped preserves streak without incrementing or breaking
    } else {
      if (i === 0) {
        // Today hasn't been completed yet, check yesterday before breaking
      } else {
        hasBroken = true;
        break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Existing streak record
  const existingStreak = await prisma.streak.findUnique({
    where: {
      userId_habitId: {
        userId,
        habitId,
      },
    },
  });

  const bestStreak = Math.max(currentStreak, existingStreak?.bestStreak || 0);

  // Calculate consistency score over past 30 days
  const completedPast30 = logs.filter((l) => l.status === "COMPLETED").length;
  const consistencyScore = Math.min(100, Math.round((completedPast30 / Math.max(1, Math.min(30, logs.length))) * 100));

  const updatedStreak = await prisma.streak.upsert({
    where: {
      userId_habitId: {
        userId,
        habitId,
      },
    },
    create: {
      userId,
      habitId,
      currentStreak,
      bestStreak,
      lastCompletedDate: currentDateStr,
      consistencyScore,
    },
    update: {
      currentStreak,
      bestStreak,
      lastCompletedDate: currentDateStr,
      consistencyScore,
    },
  });

  return updatedStreak;
}

export async function updateLinkedGoalsProgress(userId: string, habitId: string) {
  const goalHabits = await prisma.goalHabit.findMany({
    where: { habitId },
    include: {
      goal: {
        include: {
          goalHabits: {
            include: {
              habit: {
                include: {
                  streaks: true,
                },
              },
            },
          },
        },
      },
    },
  });

  for (const gh of goalHabits) {
    const goal = gh.goal;
    if (!goal || goal.status !== "ACTIVE") continue;

    let totalWeight = 0;
    let weightedConsistency = 0;

    goal.goalHabits.forEach((item) => {
      const consistency = item.habit.streaks[0]?.consistencyScore || 0;
      weightedConsistency += consistency * item.weight;
      totalWeight += item.weight;
    });

    const progressPercentage = totalWeight > 0 ? Math.min(100, Math.round(weightedConsistency / totalWeight)) : 0;

    await prisma.goal.update({
      where: { id: goal.id },
      data: { progressPercentage },
    });
  }
}
