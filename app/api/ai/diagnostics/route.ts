import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generateAIDiagnostics } from "@/services/aiService";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const diagnostics = await generateAIDiagnostics(user.id);
    return NextResponse.json(diagnostics);
  } catch (error: any) {
    console.error("AI Diagnostics API error:", error);
    return NextResponse.json({ error: "Failed to generate AI diagnostics." }, { status: 500 });
  }
}
