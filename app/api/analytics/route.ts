import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getFullAnalyticsLens, getDashboardAnalytics } from "@/services/analyticsService";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const period = (searchParams.get("period") || "30d") as "7d" | "30d" | "90d" | "365d";
    const category = searchParams.get("category") || "ALL";

    const lensData = await getFullAnalyticsLens(user.id, period, category);
    const dashboardMetrics = await getDashboardAnalytics(user.id);

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: user.id }, { isSystem: true }],
      },
    });

    return NextResponse.json({
      ...lensData,
      ...dashboardMetrics,
      availableCategories: categories.map((c) => c.name),
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics data." }, { status: 500 });
  }
}
