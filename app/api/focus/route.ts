import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addXP } from "@/services/gamificationService";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessions = await prisma.focusSession.findMany({
      where: { userId: user.id },
      include: { habit: true },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const habits = await prisma.habit.findMany({
      where: { userId: user.id, isArchived: false },
      select: { id: true, name: true, icon: true, color: true },
    });

    return NextResponse.json({ sessions, totalMinutes, habits });
  } catch (error: any) {
    console.error("Focus GET error:", error);
    return NextResponse.json({ error: "Failed to fetch focus sessions." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { durationMinutes, sessionType, habitId, notes } = await req.json();

    const session = await prisma.focusSession.create({
      data: {
        userId: user.id,
        durationMinutes: Number(durationMinutes) || 25,
        sessionType: sessionType || "POMODORO",
        habitId: habitId || null,
        notes: notes || "",
      },
    });

    // Award XP based on duration (1 XP per minute)
    const earnedXp = Math.max(10, Math.round(Number(durationMinutes)));
    await addXP(user.id, earnedXp, `Completed ${durationMinutes}m Focus Session`, session.id);

    return NextResponse.json({ success: true, session, earnedXp });
  } catch (error: any) {
    console.error("Focus POST error:", error);
    return NextResponse.json({ error: "Failed to log focus session." }, { status: 500 });
  }
}
