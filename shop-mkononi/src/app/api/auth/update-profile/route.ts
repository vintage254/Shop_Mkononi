import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";

// Schema for input validation
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().regex(/^\+?\d{1,3}[\s-]?\d{9,}$/, "Invalid phone number format").optional(),
  role: z.enum(["BUYER", "SELLER"]).optional(),
  requestedRole: z.enum(["SELLER"]).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
}).refine(data => {
  // If current password is provided, new password must also be provided
  if (data.currentPassword && !data.newPassword) {
    return false;
  }
  return true;
}, {
  message: "New password is required when current password is provided",
  path: ["newPassword"],
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
    console.log("Profile update for user:", session.user.id);

    // Parse and validate input
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      console.error("Invalid profile update data:", result.error);
      return NextResponse.json(
        { error: "Invalid data", details: result.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, currentPassword, newPassword, requestedRole } = result.data;
    const updateData: any = {};
    
    // Process name update
    if (name) {
      updateData.name = name;
    }
    
    // Process phone update
    if (phone) {
      // Check if phone number is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          NOT: {
            id: session.user.id
          }
        }
      });
      
      if (existingUser) {
        console.error("Phone number already in use");
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
      
      updateData.phone = phone;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      });
      
      if (!user?.password) {
        return NextResponse.json(
          { error: "Cannot change password for accounts without a password" },
          { status: 400 }
        );
      }
      
      // Verify current password
      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Handle seller application
    if (requestedRole === "SELLER") {
      updateData.requested_role = "SELLER";
      updateData.verification_status = "PENDING";
    }

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes to update" },
        { status: 200 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

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

export async function POST(req: Request) {
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
    console.log("Profile update for user:", session.user.id);

    // Parse and validate input
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      console.error("Invalid profile update data:", result.error);
      return NextResponse.json(
        { error: "Invalid data", details: result.error.errors },
        { status: 400 }
      );
    }

    const { name, phone, currentPassword, newPassword, requestedRole } = result.data;
    const updateData: any = {};
    
    // Process name update
    if (name) {
      updateData.name = name;
    }
    
    // Process phone update
    if (phone) {
      // Check if phone number is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          phone,
          NOT: {
            id: session.user.id
          }
        }
      });
      
      if (existingUser) {
        console.error("Phone number already in use");
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 400 }
        );
      }
      
      updateData.phone = phone;
    }

    // Handle password change
    if (currentPassword && newPassword) {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      });
      
      if (!user?.password) {
        return NextResponse.json(
          { error: "Cannot change password for accounts without a password" },
          { status: 400 }
        );
      }
      
      // Verify current password
      const passwordValid = await bcrypt.compare(currentPassword, user.password);
      if (!passwordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Handle seller application
    if (requestedRole === "SELLER") {
      updateData.requested_role = "SELLER";
      updateData.verification_status = "PENDING";
    }

    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes to update" },
        { status: 200 }
      );
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

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
