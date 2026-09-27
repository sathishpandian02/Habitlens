import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST() {
  try {
    const seedScript = path.join(process.cwd(), "prisma", "seed.js");
    await new Promise((resolve, reject) => {
      exec(`node "${seedScript}"`, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });

    return NextResponse.json({ success: true, message: "Demo data successfully reset to pristine state." });
  } catch (error: any) {
    console.error("Reset seed error:", error);
    return NextResponse.json({ error: "Failed to reset demo data." }, { status: 500 });
  }
}
