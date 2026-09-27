import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { primaryType, secondaryInterests, selectedHabits } = await req.json();

    if (!primaryType) {
      return NextResponse.json({ error: "Primary type is required." }, { status: 400 });
    }

    // 1. Update user profile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        primaryType,
        secondaryInterests: JSON.stringify(secondaryInterests || []),
        onboardingCompleted: true,
      },
      update: {
        primaryType,
        secondaryInterests: JSON.stringify(secondaryInterests || []),
        onboardingCompleted: true,
      },
    });

    // 2. Create categories and habits if provided
    if (selectedHabits && Array.isArray(selectedHabits) && selectedHabits.length > 0) {
      for (const h of selectedHabits) {
        // Ensure category exists
        let category = await prisma.category.findFirst({
          where: { userId: user.id, name: h.category || "General" },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              userId: user.id,
              name: h.category || "General",
              color: h.color || "#6366f1",
              icon: h.icon || "Sparkles",
            },
          });
        }

        // Create habit
        const createdHabit = await prisma.habit.create({
          data: {
            userId: user.id,
            categoryId: category.id,
            name: h.name,
            description: h.description || "",
            icon: h.icon || "Zap",
            goalTarget: Number(h.goalTarget) || 1,
            goalUnit: h.goalUnit || "times",
            frequencyType: h.frequencyType || "DAILY",
            scheduledDays: "[0,1,2,3,4,5,6]",
            reminderTime: h.reminderTime || "09:00",
            priority: h.priority || "MEDIUM",
            color: h.color || "#6366f1",
          },
        });

        // Initialize streak
        await prisma.streak.create({
          data: {
            userId: user.id,
            habitId: createdHabit.id,
            currentStreak: 0,
            bestStreak: 0,
            consistencyScore: 0,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Onboarding completed successfully." });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to complete onboarding." }, { status: 500 });
  }
}
