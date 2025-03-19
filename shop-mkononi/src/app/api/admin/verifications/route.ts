import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch pending verifications
    const verifications = await prisma.user.findMany({
      where: {
        OR: [
          { verificationStatus: "PENDING" },
          {
            AND: [
              { verificationStatus: { in: ["VERIFIED", "REJECTED"] } },
              { updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Last 7 days
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        role: true,
        idNumber: true,
        idFrontImage: true,
        idBackImage: true,
        selfieImage: true,
        image: true, // Include Google profile image
        verificationStatus: true,
        verificationNotes: true,
        createdAt: true,
      },
      orderBy: [
        { verificationStatus: "asc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error("Admin verifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
} 