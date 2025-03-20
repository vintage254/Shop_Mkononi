import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await req.json();
    const { notes } = body;

    // Verify the user exists and has a pending seller application
    const user = await prisma.$queryRaw`
      SELECT id, email, requested_role 
      FROM users 
      WHERE id = ${id} 
      AND requested_role = 'SELLER' 
      AND verification_status = 'PENDING'
      LIMIT 1
    `;

    if (!user || !Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { error: "User not found or no pending seller application" },
        { status: 404 }
      );
    }

    // Approve the seller application
    await prisma.$executeRaw`
      UPDATE users 
      SET 
        role = 'SELLER',
        requested_role = NULL,
        verification_status = 'VERIFIED',
        verification_notes = ${notes || 'Application approved'},
        verified_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    // TODO: Send notification to the user about approval

    return NextResponse.json({ 
      message: "Seller application approved successfully" 
    });
  } catch (error) {
    console.error("Error approving seller application:", error);
    return NextResponse.json(
      { error: "Failed to approve seller application" },
      { status: 500 }
    );
  }
}
