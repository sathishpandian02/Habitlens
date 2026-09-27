import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fullName, bio, primaryType, secondaryInterests, theme, remindersEnabled, weeklySummaryEnabled } = await req.json();

    // Update User
    if (fullName) {
      await prisma.user.update({
        where: { id: user.id },
        data: { fullName: fullName.trim() },
      });
    }

    // Update Profile
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bio: bio || "",
        primaryType: primaryType || "Personal Growth",
        secondaryInterests: typeof secondaryInterests === "string" ? secondaryInterests : JSON.stringify(secondaryInterests || []),
      },
      update: {
        bio: bio !== undefined ? bio : undefined,
        primaryType: primaryType !== undefined ? primaryType : undefined,
        secondaryInterests: secondaryInterests !== undefined ? (typeof secondaryInterests === "string" ? secondaryInterests : JSON.stringify(secondaryInterests)) : undefined,
      },
    });

    // Update Settings
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        theme: theme || "dark",
        remindersEnabled: remindersEnabled ?? true,
        weeklySummaryEnabled: weeklySummaryEnabled ?? true,
      },
      update: {
        theme: theme !== undefined ? theme : undefined,
        remindersEnabled: remindersEnabled !== undefined ? remindersEnabled : undefined,
        weeklySummaryEnabled: weeklySummaryEnabled !== undefined ? weeklySummaryEnabled : undefined,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true, settings: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
