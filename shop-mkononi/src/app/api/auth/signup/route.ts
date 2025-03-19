import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Create Prisma client
const prisma = new PrismaClient();

// Schema for input validation
const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
  phone: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("Signup request received:", {
      email: body.email,
      name: body.name || "Not provided",
      phone: body.phone || "Not provided",
      role: body.role || "BUYER"
    });
    
    // Validate input
    const validatedData = signUpSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.$queryRaw`
      SELECT email, phone FROM users 
      WHERE email = ${validatedData.email} OR phone = ${validatedData.phone}
      LIMIT 1
    `;

    if (existingUser && Array.isArray(existingUser) && existingUser.length > 0) {
      const user = existingUser[0] as any;
      
      if (user.email === validatedData.email) {
        console.log("Email already registered:", validatedData.email);
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }
      
      if (user.phone === validatedData.phone) {
        console.log("Phone already registered:", validatedData.phone);
        return NextResponse.json(
          { error: "Phone number already registered" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    try {
      // Generate UUID
      const uuid = await prisma.$queryRaw`SELECT uuid_generate_v4()`;
      const userId = (uuid as any)[0].uuid_generate_v4;
      console.log("Generated UUID for new user:", userId);
      
      // Create user with raw SQL
      await prisma.$executeRaw`
        INSERT INTO users (
          id,
          email,
          password,
          name,
          role,
          phone,
          is_verified,
          verification_status,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${validatedData.email},
          ${hashedPassword},
          ${validatedData.name || ''},
          ${validatedData.role},
          ${validatedData.phone},
          false,
          'PENDING',
          NOW(),
          NOW()
        )
      `;
      
      console.log("User created successfully with ID:", userId);
      
      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: userId,
            email: validatedData.email,
            name: validatedData.name,
            role: validatedData.role,
            phone: validatedData.phone
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error during user creation:", dbError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}