import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  try {
    let demoUser = await prisma.user.findFirst({
      where: { username: "guest" },
      include: {
        profile: true,
        settings: true,
      },
    });

    if (!demoUser) {
      demoUser = await prisma.user.findFirst({
        include: {
          profile: true,
          settings: true,
        },
      });
    }

    if (!demoUser) {
      return NextResponse.json({ error: "Demo user not found. Please run database seed." }, { status: 404 });
    }

    const token = signToken({
      userId: demoUser.id,
      email: demoUser.email,
      username: demoUser.username,
      role: demoUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in as demo user",
      user: {
        id: demoUser.id,
        fullName: demoUser.fullName,
        username: demoUser.username,
        email: demoUser.email,
        role: demoUser.role,
        profile: demoUser.profile,
        settings: demoUser.settings,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Failed to initiate demo mode." }, { status: 500 });
  }
}
