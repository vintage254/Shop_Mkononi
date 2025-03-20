import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    // Find the verification code record
    const verificationRecord = await prisma.verificationCode.findUnique({
      where: { userId: session.user.id },
    });

    if (!verificationRecord) {
      return NextResponse.json({ error: "No verification code found" }, { status: 400 });
    }

    // Check if code is expired
    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 400 });
    }

    // Check if too many attempts
    if (verificationRecord.attempts >= 5) {
      return NextResponse.json({ error: "Too many failed attempts" }, { status: 400 });
    }

    // Increment attempts
    await prisma.verificationCode.update({
      where: { userId: session.user.id },
      data: { attempts: { increment: 1 } },
    });

    // Verify the code
    if (verificationRecord.code !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Mark user's phone as verified
    await prisma.user.update({
      where: { id: session.user.id },
      data: { phoneVerified: true },
    });

    // Remove the verification code record
    await prisma.verificationCode.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ message: "Phone verified successfully" });
  } catch (error) {
    console.error("Error verifying phone code:", error);
    return NextResponse.json({ error: "Failed to verify phone" }, { status: 500 });
  }
}
