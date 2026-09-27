import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserHabitAnalytics } from "@/services/habitAnalyticsService";
import { queryAICoach, ChatMessage } from "@/services/openrouterService";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const userPrompt: string = (body.message || body.prompt || "Please analyze my habit consistency and provide tailored advice.").trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    // 1. Pull dynamic database analytics for the past 30 days
    const userHabitContext = await getUserHabitAnalytics(user.id, 30);

    // 2. Query OpenRouter with fallback to offline engine
    const aiResponse = await queryAICoach(userHabitContext, userPrompt, history);

    // 3. Persist conversation turn in database
    await prisma.aIConversation.create({
      data: {
        userId: user.id,
        role: "USER",
        message: userPrompt,
      },
    });

    await prisma.aIConversation.create({
      data: {
        userId: user.id,
        role: "ASSISTANT",
        message: aiResponse.reply,
        metadata: JSON.stringify({
          modelUsed: aiResponse.modelUsed,
          source: aiResponse.source,
        }),
      },
    });

    // 4. Return structured response
    return NextResponse.json({
      success: true,
      reply: aiResponse.reply,
      modelUsed: aiResponse.modelUsed,
      source: aiResponse.source,
      context: {
        user: userHabitContext.user,
        overview: userHabitContext.overview,
        strengths: userHabitContext.strengths,
        moderate: userHabitContext.moderate,
        weaknesses: userHabitContext.weaknesses,
        goals: userHabitContext.goals,
      },
    });
  } catch (error: any) {
    console.error("AI Coach Next.js Route error:", error);
    return NextResponse.json(
      {
        error: "Failed to process AI Coach request.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
