import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  notes: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { status, notes } = updateSchema.parse(body);

    // Update user verification status
    const user = await prisma.user.update({
      where: { id: params.userId },
      data: {
        verificationStatus: status,
        verificationNotes: notes,
        isVerified: status === "VERIFIED",
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      },
    });

    // If verification is approved for a seller, create their shop
    if (status === "VERIFIED" && user.role === "SELLER") {
      const shopSlug = user.email.split("@")[0].toLowerCase();
      
      await prisma.shop.create({
        data: {
          name: `${shopSlug}'s Shop`,
          slug: shopSlug,
          description: `Welcome to ${shopSlug}'s Shop on Shop Mkononi`,
          sellerId: user.id,
        },
      });
    }

    return NextResponse.json({
      message: `User verification ${status.toLowerCase()}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Admin verification update error:", error);
    return NextResponse.json(
      { error: "Failed to update verification status" },
      { status: 500 }
    );
  }
} 