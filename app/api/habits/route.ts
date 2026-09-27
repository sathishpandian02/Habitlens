import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const statusFilter = searchParams.get("status"); // active, paused, archived

    const habits = await prisma.habit.findMany({
      where: {
        userId: user.id,
        ...(category && category !== "ALL" ? { category: { name: category } } : {}),
        ...(search ? { name: { contains: search } } : {}),
        ...(statusFilter === "paused" ? { isPaused: true } : statusFilter === "archived" ? { isArchived: true } : { isArchived: false }),
      },
      include: {
        category: true,
        streaks: true,
      },
      orderBy: [{ isPaused: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    });

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: user.id }, { isSystem: true }],
      },
    });

    return NextResponse.json({ habits, categories });
  } catch (error: any) {
    console.error("Habits GET error:", error);
    return NextResponse.json({ error: "Failed to fetch habits." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      newCategoryName,
      icon,
      goalTarget,
      goalUnit,
      frequencyType,
      scheduledDays,
      reminderTime,
      priority,
      difficulty,
      color,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Habit name is required." }, { status: 400 });
    }

    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && newCategoryName) {
      const newCat = await prisma.category.create({
        data: {
          userId: user.id,
          name: newCategoryName.trim(),
          color: color || "#6366f1",
          icon: icon || "Folder",
        },
      });
      resolvedCategoryId = newCat.id;
    }

    const newHabit = await prisma.habit.create({
      data: {
        userId: user.id,
        categoryId: resolvedCategoryId || null,
        name: name.trim(),
        description: description || "",
        icon: icon || "Zap",
        goalTarget: Number(goalTarget) || 1,
        goalUnit: goalUnit || "times",
        frequencyType: frequencyType || "DAILY",
        scheduledDays: typeof scheduledDays === "string" ? scheduledDays : JSON.stringify(scheduledDays || [0, 1, 2, 3, 4, 5, 6]),
        reminderTime: reminderTime || null,
        priority: priority || "MEDIUM",
        difficulty: difficulty || "MEDIUM",
        color: color || "#6366f1",
      },
      include: {
        category: true,
      },
    });

    // Initialize streak record
    const streak = await prisma.streak.create({
      data: {
        userId: user.id,
        habitId: newHabit.id,
        currentStreak: 0,
        bestStreak: 0,
        consistencyScore: 0,
      },
    });

    return NextResponse.json({ success: true, habit: { ...newHabit, streaks: [streak] } });
  } catch (error: any) {
    console.error("Habit create error:", error);
    return NextResponse.json({ error: "Failed to create habit." }, { status: 500 });
  }
}
