import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { toggleHabitStatus, getDailyScore } from "@/services/habitService";
import { getTodayDateString } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const habitId = params.id;
    const body = await req.json();
    const { status, date = getTodayDateString(), notes } = body;

    if (!["COMPLETED", "SKIPPED", "MISSED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const result = await toggleHabitStatus(user.id, habitId, status, date, notes);
    const updatedDailyScore = await getDailyScore(user.id, date);

    return NextResponse.json({
      success: true,
      log: result.log,
      streak: result.streak,
      xpAwarded: result.xpAwarded,
      dailyScore: updatedDailyScore,
    });
  } catch (error: any) {
    console.error("Habit toggle error:", error);
    return NextResponse.json({ error: error.message || "Failed to toggle habit status." }, { status: 500 });
  }
}
