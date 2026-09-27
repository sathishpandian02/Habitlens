import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getTodayDateString } from "@/lib/utils";
import { addXP } from "@/services/gamificationService";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || getTodayDateString();

    const reflection = await prisma.dailyReflection.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    });

    const pastReflections = await prisma.dailyReflection.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 14,
    });

    return NextResponse.json({ reflection, pastReflections });
  } catch (error: any) {
    console.error("Reflections GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reflections." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date = getTodayDateString(), mood, energyLevel, notes } = await req.json();

    const reflection = await prisma.dailyReflection.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      create: {
        userId: user.id,
        date,
        mood: mood || "GOOD",
        energyLevel: energyLevel || "MEDIUM",
        notes: notes || "",
      },
      update: {
        mood: mood || "GOOD",
        energyLevel: energyLevel || "MEDIUM",
        notes: notes || "",
      },
    });

    // Award reflection XP
    await addXP(user.id, 15, "Logged Daily Reflection", `reflection-${date}`);

    return NextResponse.json({ success: true, reflection });
  } catch (error: any) {
    console.error("Reflections POST error:", error);
    return NextResponse.json({ error: "Failed to save reflection." }, { status: 500 });
  }
}
