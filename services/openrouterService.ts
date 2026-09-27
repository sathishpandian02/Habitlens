import OpenAI from "openai";
import { HabitUserContext } from "./habitAnalyticsService";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "liquid/lfm-2.5-2.6b:free";

const FALLBACK_MODELS = [
  "liquid/lfm-2.5-2.6b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "z-ai/glm-5.2:free",
  "nvidia/nemotron-3.5-lightning:free",
  "mistralai/mistral-7b-instruct:free",
];

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AICoachResponse {
  reply: string;
  modelUsed: string;
  source: "OPENROUTER" | "OFFLINE_FALLBACK";
  contextSnapshot: {
    userName: string;
    overallRate: number;
    trendDirection: string;
    strengthsCount: number;
    weaknessesCount: number;
  };
}

/**
 * Builds the comprehensive behavioral science system prompt injected with actual user telemetry.
 */
function buildSystemPrompt(context: HabitUserContext): string {
  const { user, overview, strengths, weaknesses, goals, recentReflections } = context;

  const topStrengths = strengths.slice(0, 3).map((s) => `${s.name} (${s.completionRate}%, ${s.currentStreak}d streak)`).join(", ") || "None above 80%";
  const topWeaknesses = weaknesses.slice(0, 3).map((w) => `${w.name} (${w.completionRate}%, ${w.missedLogs} missed)`).join(", ") || "None below 50%";
  const activeGoals = goals.map((g) => `${g.title} (${g.progressPercentage}% complete)`).join(", ") || "No active goals logged";
  const recentMood = recentReflections[0] ? `Recent mood: ${recentReflections[0].mood}, Energy: ${recentReflections[0].energyLevel}` : "No recent mood logged";

  return `You are the HabitLens AI Coach — an elite behavioral scientist, habit strategist, and personal growth mentor.
You have real-time access to the user's authentic HabitLens database telemetry.

=== USER TELEMETRY & ACTUAL PERFORMANCE DATA ===
- Name: ${user.fullName || user.username}
- Archetype: ${user.archetype}
- Level: Level ${user.level} (${user.totalXp} XP accumulated)
- 30-Day Overall Adherence: ${overview.overallCompletionRate}% (${overview.totalCompleted}/${overview.totalScheduled} sessions)
- Current Week Completion: ${overview.currentWeekRate}%
- Previous Week Completion: ${overview.previousWeekRate}%
- Trend: ${overview.trendDirection} (${overview.trendPercentage >= 0 ? `+${overview.trendPercentage}%` : `${overview.trendPercentage}%`} WoW)
- Strong Habits (>=80%): ${topStrengths}
- Struggling/Weak Habits (<50%): ${topWeaknesses}
- Active Goals: ${activeGoals}
- Wellness State: ${recentMood}
=================================================

=== YOUR COACHING GUIDELINES ===
1. CONTEXTUAL RELEVANCE: When the user asks about their habits, consistency, routine, or progress, cite their ACTUAL numbers, streaks, and habit names (e.g. mention their specific completion rates or weakest habits).
2. GENERAL KNOWLEDGE CAPABILITY: You are also a broad personal growth and life assistant. If the user asks a general question (about productivity, coding, philosophy, science, time management, nutrition, motivation, career, or general advice), answer thoroughly and helpfully! You are NOT restricted to only answering habit questions.
3. TONE & EMPATHY: Be encouraging, supportive, insightful, and practical. NEVER shame, judge, or lecture the user for missed habits or declining consistency.
4. ACTIONABLE MICRO-STEPS: When solving habit hurdles, suggest specific behavioral techniques:
   - Habit Stacking (anchoring a struggling habit to an existing strong habit).
   - The 2-Minute Rule / Friction Reduction (scale down difficulty on low-energy days).
   - Implementation Intentions ("I will do [Habit] at [Time] in [Location]").
5. FORMATTING: Use clean Markdown with bold text and short bullet points for high readability. Keep replies punchy, engaging, and conversational (around 2 to 4 short paragraphs or bulleted recommendations).`;
}

/**
 * Intelligent rule-based offline recommendation engine.
 * Guarantees zero downtime when OpenRouter rate limits or network issues occur.
 */
function generateOfflineFallback(context: HabitUserContext, userPrompt: string): string {
  const q = userPrompt.toLowerCase();
  const { user, overview, strengths, weaknesses } = context;
  const firstName = user.fullName ? user.fullName.split(" ")[0] : user.username;

  if (q.includes("why") && (q.includes("fail") || q.includes("consisten") || q.includes("drop") || q.includes("struggl"))) {
    if (weaknesses.length > 0) {
      const weakList = weaknesses.slice(0, 2).map((w) => `**${w.name}** (${w.completionRate}% completion)`).join(" and ");
      return `Hey ${firstName}, looking closely at your last 30 days of data:

Your overall consistency is at **${overview.overallCompletionRate}%**, and the primary drag is concentrated in ${weakList}.

Here is the behavioral diagnosis:
1. **Friction Overload:** Habits placed in the afternoon or evening are susceptible to decision fatigue.
2. **Actionable Fix:** Try the **2-Minute Rule** for the next 3 days. Shrink ${weaknesses[0].name} down to its absolute minimum viable version (e.g., 5 minutes) just to protect your daily repetition.
3. **Habit Stack:** Anchor it directly after your strongest habit (**${strengths[0]?.name || "your morning routine"}**).

Consistency isn't all-or-nothing — a 5-minute win keeps your neural pathway alive!`;
    }
    return `Hey ${firstName}, your weekly score is **${overview.currentWeekRate}%** (${overview.trendPercentage >= 0 ? `+${overview.trendPercentage}%` : `${overview.trendPercentage}%`} vs last week). Most drops happen because targets are set for ideal days rather than tired days. Focus on winning your top anchor habit first thing tomorrow morning.`;
  }

  if (q.includes("plan") || q.includes("tomorrow") || q.includes("schedule") || q.includes("week")) {
    const primaryWeak = weaknesses[0]?.name || "Deep Focus";
    const primaryStrong = strengths[0]?.name || "Daily Movement";

    return `Here is your high-leverage Action Blueprint for tomorrow, ${firstName}:

1. **Morning Lock-in (08:00 AM):** Execute **${primaryStrong}** early. Winning early sets the neurological tone for the whole day.
2. **Friction-Reduced Session (02:30 PM):** Dedicate a 15-minute focused block for **${primaryWeak}**. Remove your phone from the room.
3. **Evening Review (09:30 PM):** Log your HabitLens reflection and prepare your environment for the next morning.

Completing your scheduled habits tomorrow will keep your ${overview.trendDirection.toLowerCase()} trend on track!`;
  }

  if (q.includes("goal") || q.includes("progress") || q.includes("score") || q.includes("stats")) {
    return `Here is your HabitLens executive snapshot, ${firstName}:

- **Level & XP:** Level ${user.level} (${user.totalXp} Total XP earned)
- **30-Day Adherence:** **${overview.overallCompletionRate}%** across ${overview.totalScheduled} scheduled sessions.
- **Weekly Trend:** ${overview.trendDescription}
- **Top Anchor:** ${strengths[0] ? `**${strengths[0].name}** at ${strengths[0].completionRate}% consistency` : "Establishing anchor"}
- **Area for Leverage:** ${weaknesses[0] ? `**${weaknesses[0].name}** (${weaknesses[0].completionRate}%)` : "All habits above 50%!"}

You are in **${user.archetype}** mode. What specific habit would you like to level up next?`;
  }

  // General self-improvement / productivity response
  return `Great question, ${firstName}!

As your **${user.archetype}** coach, here is the key principle to keep in mind:

> *"You do not rise to the level of your goals. You fall to the level of your systems."*

Looking at your active routine, you have already built solid momentum with **${overview.totalCompleted} completed sessions** (Overall Adherence: **${overview.overallCompletionRate}%**).

To tackle "${userPrompt}":
- **Break it down:** Identify the smallest next physical action you can complete in under 5 minutes.
- **Protect your energy:** Prioritize restorative sleep; our analytics show habit completion jumps over 20% when your morning starts without cognitive overload.
- **Consistency over intensity:** Small daily actions compounded over 30 days will always outperform sporadic bursts of heroic effort.

What specific area would you like to dive deeper into?`;
}

/**
 * Executes a context-aware chat request using OpenRouter with automatic model fallback
 * and offline rule-based safety net.
 */
export async function queryAICoach(
  context: HabitUserContext,
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<AICoachResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  const contextSnapshot = {
    userName: context.user.fullName || context.user.username,
    overallRate: context.overview.overallCompletionRate,
    trendDirection: context.overview.trendDirection,
    strengthsCount: context.strengths.length,
    weaknessesCount: context.weaknesses.length,
  };

  // If no API key configured, use offline fallback directly
  if (!apiKey || apiKey === "placeholder" || apiKey.trim() === "") {
    return {
      reply: generateOfflineFallback(context, userMessage),
      modelUsed: "offline-rule-engine",
      source: "OFFLINE_FALLBACK",
      contextSnapshot,
    };
  }

  const systemPrompt = buildSystemPrompt(context);

  // Prepare messages array with System Prompt + History (up to last 8 turns) + User Message
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-8).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  // Try primary model, then fallback models
  const candidateModels = [DEFAULT_MODEL, ...FALLBACK_MODELS.filter((m) => m !== DEFAULT_MODEL)];

  const openai = new OpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://habitlens.io",
      "X-Title": "HabitLens",
    },
  });

  for (const model of candidateModels) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const replyContent = response.choices?.[0]?.message?.content;
      if (replyContent && replyContent.trim().length > 0) {
        return {
          reply: replyContent.trim(),
          modelUsed: model,
          source: "OPENROUTER",
          contextSnapshot,
        };
      }
    } catch (err: any) {
      console.warn(`OpenRouter model ${model} failed: ${err.message || err}. Trying next fallback...`);
      // Continue to next candidate model
    }
  }

  // If all OpenRouter candidate models failed (rate limit, queue congestion, network), gracefully fallback
  console.info("All OpenRouter models exhausted or rate-limited. Activating intelligent offline fallback engine.");
  return {
    reply: generateOfflineFallback(context, userMessage),
    modelUsed: "offline-rule-engine-fallback",
    source: "OFFLINE_FALLBACK",
    contextSnapshot,
  };
}
