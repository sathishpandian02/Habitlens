import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { format, subDays, eachDayOfInterval } from "date-fns";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habitId = params.id;
    const habit = await prisma.habit.findUnique({
      where: { id: habitId, userId: user.id },
      include: {
        category: true,
        streaks: true,
        logs: {
          orderBy: { date: "desc" },
          take: 60,
        },
      },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const today = new Date();
    const last30Interval = eachDayOfInterval({
      start: subDays(today, 29),
      end: today,
    }).map((d) => format(d, "yyyy-MM-dd"));

    const logsMap = new Map(habit.logs.map((l) => [l.date, l]));
    const monthLogs = last30Interval.map((dateStr) => ({
      date: dateStr,
      status: logsMap.get(dateStr)?.status || "MISSED",
    }));

    const completedPast30 = monthLogs.filter((l) => l.status === "COMPLETED").length;
    const completionRate = Math.round((completedPast30 / 30) * 100);

    return NextResponse.json({
      habit,
      analytics: {
        completionRate,
        completedPast30,
        totalDays: 30,
        currentStreak: habit.streaks[0]?.currentStreak || 0,
        bestStreak: habit.streaks[0]?.bestStreak || 0,
        monthLogs,
      },
    });
  } catch (error: any) {
    console.error("Habit detail GET error:", error);
    return NextResponse.json({ error: "Failed to fetch habit details." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habitId = params.id;
    const body = await req.json();

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId, userId: user.id },
      data: {
        name: body.name,
        description: body.description,
        categoryId: body.categoryId || null,
        icon: body.icon,
        goalTarget: Number(body.goalTarget) || 1,
        goalUnit: body.goalUnit,
        frequencyType: body.frequencyType,
        scheduledDays: typeof body.scheduledDays === "string" ? body.scheduledDays : JSON.stringify(body.scheduledDays || [0, 1, 2, 3, 4, 5, 6]),
        reminderTime: body.reminderTime,
        priority: body.priority,
        difficulty: body.difficulty,
        color: body.color,
        isPaused: body.isPaused,
        isArchived: body.isArchived,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, habit: updatedHabit });
  } catch (error: any) {
    console.error("Habit update error:", error);
    return NextResponse.json({ error: "Failed to update habit." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habitId = params.id;
    await prisma.habit.delete({
      where: { id: habitId, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Habit deleted successfully." });
  } catch (error: any) {
    console.error("Habit delete error:", error);
    return NextResponse.json({ error: "Failed to delete habit." }, { status: 500 });
  }
}
