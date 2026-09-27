import { NextResponse } from "next/server";
import { getSessionUser, AUTH_COOKIE_NAME } from "@/lib/auth";
import { getUserGamificationStats } from "@/services/gamificationService";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const gamification = await getUserGamificationStats(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        gamification,
      },
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
