import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Twilio } from "twilio";

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Validate phone number format (basic validation, can be enhanced)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code in the database with expiration time (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Update or create verification code record
    await prisma.verificationCode.upsert({
      where: { userId: session.user.id },
      update: {
        code: verificationCode,
        expiresAt,
        attempts: 0,
      },
      create: {
        userId: session.user.id,
        code: verificationCode,
        expiresAt,
        attempts: 0,
      },
    });

    // Update user's phone number if it has changed
    if (session.user.phone !== phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone },
      });
    }

    // Send SMS via Twilio if configured
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your Shop Mkononi verification code is: ${verificationCode}. It expires in 15 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
      } catch (twilioError) {
        console.error("Twilio error:", twilioError);
        // In development or if Twilio is not configured properly, log the code
        console.log(`Development verification code for ${phone}: ${verificationCode}`);
        
        return NextResponse.json({ 
          message: "Verification code generated (Twilio not configured properly)",
          devCode: process.env.NODE_ENV === "development" ? verificationCode : undefined
        });
      }
    } else {
      // In development or if Twilio is not configured, log the code
      console.log(`Development verification code for ${phone}: ${verificationCode}`);
      
      return NextResponse.json({ 
        message: "Verification code generated (Twilio not configured)",
        devCode: process.env.NODE_ENV === "development" ? verificationCode : undefined
      });
    }

    return NextResponse.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}
