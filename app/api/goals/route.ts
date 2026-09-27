import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        goalHabits: {
          include: {
            habit: {
              include: {
                streaks: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const userHabits = await prisma.habit.findMany({
      where: { userId: user.id, isArchived: false },
      select: { id: true, name: true, icon: true, color: true },
    });

    return NextResponse.json({ goals, userHabits });
  } catch (error: any) {
    console.error("Goals GET error:", error);
    return NextResponse.json({ error: "Failed to fetch goals." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, category, targetDate, linkedHabits } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Goal title is required." }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        description: description || "",
        category: category || "Personal Growth",
        targetDate: targetDate ? new Date(targetDate) : null,
        progressPercentage: 0,
        status: "ACTIVE",
      },
    });

    if (linkedHabits && Array.isArray(linkedHabits) && linkedHabits.length > 0) {
      for (const h of linkedHabits) {
        await prisma.goalHabit.create({
          data: {
            goalId: goal.id,
            habitId: h.habitId || h.id || h,
            weight: Number(h.weight) || 1.0,
          },
        });
      }
    }

    return NextResponse.json({ success: true, goal });
  } catch (error: any) {
    console.error("Goals POST error:", error);
    return NextResponse.json({ error: "Failed to create goal." }, { status: 500 });
  }
}
