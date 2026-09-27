import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addXP } from "@/services/gamificationService";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      include: {
        participants: {
          where: { userId: user.id },
        },
      },
    });

    const formattedChallenges = challenges.map((ch) => {
      const participation = ch.participants[0];
      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        category: ch.category,
        durationDays: ch.durationDays,
        targetCount: ch.targetCount,
        badgeReward: ch.badgeReward,
        isJoined: !!participation,
        progressCount: participation ? participation.progressCount : 0,
        isCompleted: participation ? participation.isCompleted : false,
        joinedAt: participation?.joinedAt || null,
      };
    });

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error: any) {
    console.error("Challenges GET error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { challengeId, action } = await req.json(); // action: "JOIN" | "INCREMENT"

    if (action === "JOIN") {
      const participant = await prisma.challengeParticipant.upsert({
        where: {
          challengeId_userId: {
            challengeId,
            userId: user.id,
          },
        },
        create: {
          challengeId,
          userId: user.id,
          progressCount: 0,
          isCompleted: false,
        },
        update: {},
      });

      return NextResponse.json({ success: true, participant });
    }

    if (action === "INCREMENT") {
      const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
      if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

      const participant = await prisma.challengeParticipant.findUnique({
        where: { challengeId_userId: { challengeId, userId: user.id } },
      });

      if (!participant) return NextResponse.json({ error: "Not enrolled in challenge" }, { status: 400 });

      const newProgress = participant.progressCount + 1;
      const isCompleted = newProgress >= challenge.targetCount;

      const updated = await prisma.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          progressCount: newProgress,
          isCompleted,
        },
      });

      if (isCompleted && !participant.isCompleted) {
        await addXP(user.id, 200, `Completed Challenge: ${challenge.title}`, challenge.id);
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "ACHIEVEMENT",
            title: `🎯 Challenge Completed: ${challenge.title}!`,
            message: `Congratulations! You conquered the challenge and earned +200 XP!`,
            link: "/dashboard/challenges",
          },
        });
      }

      return NextResponse.json({ success: true, participant: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Challenges POST error:", error);
    return NextResponse.json({ error: "Failed to update challenge." }, { status: 500 });
  }
}
