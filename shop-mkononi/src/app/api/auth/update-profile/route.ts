import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for input validation
const updateProfileSchema = z.object({
  role: z.enum(["BUYER", "SELLER"]).optional(),
  requestedRole: z.enum(["SELLER"]).optional(),
  phone: z.string().regex(/^\+?\d{1,3}[\s-]?\d{9,}$/, "Invalid phone number format"),
});

export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("Unauthorized profile update attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    console.log("Profile update for user:", session.user.id, body);

    // Parse and validate input
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      console.error("Invalid profile update data:", result.error);
      return NextResponse.json(
        { error: "Invalid data", details: result.error.errors },
        { status: 400 }
      );
    }

    const { role, requestedRole, phone } = result.data;

    // If phone number is provided, check if it's already taken by another user
    if (phone) {
      const existingUser = await prisma.$queryRaw`
        SELECT id FROM users WHERE phone = ${phone} AND id != ${session.user.id} LIMIT 1
      `;
      
      if (existingUser && existingUser[0]) {
        console.error("Phone number already in use");
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
    }

    // Handle seller application
    if (requestedRole === "SELLER") {
      // Update user with requested role and set verification status to PENDING
      await prisma.$executeRaw`
        UPDATE users 
        SET requested_role = 'SELLER', 
            phone = ${phone}, 
            verification_status = 'PENDING', 
            updated_at = NOW() 
        WHERE id = ${session.user.id}
      `;
      
      console.log("Seller application initiated for user:", session.user.id);
      
      return NextResponse.json(
        { message: "Seller application initiated" },
        { status: 200 }
      );
    }

    // Regular profile update (for admins or system updates)
    if (role) {
      await prisma.$executeRaw`
        UPDATE users 
        SET role = ${role}, phone = ${phone}, updated_at = NOW() 
        WHERE id = ${session.user.id}
      `;
    } else {
      // Just update phone
      await prisma.$executeRaw`
        UPDATE users 
        SET phone = ${phone}, updated_at = NOW() 
        WHERE id = ${session.user.id}
      `;
    }

    console.log("Profile updated successfully");
    
    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
