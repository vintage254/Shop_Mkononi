import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      console.error("Unauthorized admin access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all users with pending seller applications
    const applications = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        email,
        phone,
        id_number as "idNumber",
        id_front_image as "idFrontImage",
        id_back_image as "idBackImage",
        selfie_image as "selfieImage",
        verification_status as "verificationStatus",
        verification_notes as "verificationNotes",
        created_at as "createdAt"
      FROM users 
      WHERE requested_role = 'SELLER' 
      AND verification_status = 'PENDING'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching seller applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller applications" },
      { status: 500 }
    );
  }
}
