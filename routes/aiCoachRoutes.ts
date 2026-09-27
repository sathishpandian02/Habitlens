import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserHabitAnalytics } from "../services/habitAnalyticsService";
import { queryAICoach, ChatMessage } from "../services/openrouterService";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "habitlens-super-secure-production-jwt-secret-key-2026";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
    role: string;
  };
}

/**
 * JWT Authentication Middleware
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

/**
 * POST /api/ai-coach/analyze-and-chat
 * Production endpoint analyzing user habit telemetry and generating context-aware AI coaching advice.
 */
router.post(
  "/analyze-and-chat",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized user session." });
      }

      const { message, prompt, history } = req.body;
      const userPrompt: string = (message || prompt || "Please provide an overall analysis of my habit consistency and key recommendations.").trim();
      const conversationHistory: ChatMessage[] = Array.isArray(history) ? history : [];

      // 1. Pull dynamic database analytics for the past 30 days
      const userHabitContext = await getUserHabitAnalytics(userId, 30);

      // 2. Query OpenRouter with fallback to offline behavioral engine
      const aiResponse = await queryAICoach(userHabitContext, userPrompt, conversationHistory);

      // 3. Return structured payload for frontend consumption
      return res.status(200).json({
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
      console.error("AI Coach Controller error:", error);
      return res.status(500).json({
        error: "Internal server error while analyzing habits and generating AI advice.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

export default router;
