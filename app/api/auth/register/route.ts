import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { DEFAULT_ACHIEVEMENTS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { fullName, username, email, password } = await req.json();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // Check duplicate email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase().trim()) {
        return NextResponse.json({ error: "Email is already registered." }, { status: 409 });
      }
      return NextResponse.json({ error: "Username is already taken." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        profile: {
          create: {
            primaryType: "Personal Growth",
            secondaryInterests: "[]",
            onboardingCompleted: false,
          },
        },
        settings: {
          create: {
            theme: "dark",
            remindersEnabled: true,
            weeklySummaryEnabled: true,
          },
        },
      },
      include: {
        profile: true,
        settings: true,
      },
    });

    // Ensure system achievements exist in DB
    const achCount = await prisma.achievement.count();
    if (achCount === 0) {
      for (const ach of DEFAULT_ACHIEVEMENTS) {
        await prisma.achievement.create({ data: ach });
      }
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
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
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user." }, { status: 500 });
  }
}
