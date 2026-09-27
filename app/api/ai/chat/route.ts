import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserHabitAnalytics } from "@/services/habitAnalyticsService";
import { queryAICoach, ChatMessage } from "@/services/openrouterService";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const message = body.message;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 1. Fetch recent conversation history for multi-turn context
    const recentDbConversations = await prisma.aIConversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const conversationHistory: ChatMessage[] = recentDbConversations
      .reverse()
      .map((c) => ({
        role: c.role.toLowerCase() as "user" | "assistant" | "system",
        content: c.message,
      }));

    // 2. Fetch live habit telemetry context
    const userHabitContext = await getUserHabitAnalytics(user.id, 30);

    // 3. Query OpenRouter with fallback
    const aiResponse = await queryAICoach(userHabitContext, message, conversationHistory);

    // 4. Save user message to AI conversation history
    await prisma.aIConversation.create({
      data: {
        userId: user.id,
        role: "USER",
        message,
      },
    });

    // 5. Save assistant response
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

    return NextResponse.json({
      reply: aiResponse.reply,
      modelUsed: aiResponse.modelUsed,
      source: aiResponse.source,
      context: {
        overview: userHabitContext.overview,
        strengths: userHabitContext.strengths,
        weaknesses: userHabitContext.weaknesses,
      },
    });
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
