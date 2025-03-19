import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("Unauthorized verification attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Processing verification for user:", session.user.id);

    // Get form data
    const formData = await req.formData();
    const idNumber = formData.get("idNumber") as string;
    const idFrontImage = formData.get("idFrontImage") as File;
    const idBackImage = formData.get("idBackImage") as File;
    const selfieImage = formData.get("selfieImage") as File;

    if (!idNumber || !idFrontImage || !idBackImage || !selfieImage) {
      console.error("Missing required fields:", {
        hasIdNumber: !!idNumber,
        hasIdFrontImage: !!idFrontImage,
        hasIdBackImage: !!idBackImage,
        hasSelfieImage: !!selfieImage
      });
      
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      // Upload ID front image to Cloudinary
      console.log("Uploading ID front image");
      const idFrontBuffer = await idFrontImage.arrayBuffer();
      const idFrontBase64 = Buffer.from(idFrontBuffer).toString("base64");
      const idFrontDataURI = `data:${idFrontImage.type};base64,${idFrontBase64}`;
      
      const idFrontUploadResult = await cloudinary.uploader.upload(idFrontDataURI, {
        folder: "shop-mkononi/ids/front",
        resource_type: "image",
      });

      // Upload ID back image to Cloudinary
      console.log("Uploading ID back image");
      const idBackBuffer = await idBackImage.arrayBuffer();
      const idBackBase64 = Buffer.from(idBackBuffer).toString("base64");
      const idBackDataURI = `data:${idBackImage.type};base64,${idBackBase64}`;
      
      const idBackUploadResult = await cloudinary.uploader.upload(idBackDataURI, {
        folder: "shop-mkononi/ids/back",
        resource_type: "image",
      });

      // Upload selfie to Cloudinary
      console.log("Uploading selfie");
      const selfieBuffer = await selfieImage.arrayBuffer();
      const selfieBase64 = Buffer.from(selfieBuffer).toString("base64");
      const selfieDataURI = `data:${selfieImage.type};base64,${selfieBase64}`;
      
      const selfieUploadResult = await cloudinary.uploader.upload(selfieDataURI, {
        folder: "shop-mkononi/selfies",
        resource_type: "image",
      });

      // Update user verification details
      console.log("Updating user verification details");
      await prisma.$executeRaw`
        UPDATE users 
        SET 
          id_number = ${idNumber},
          id_front_image = ${idFrontUploadResult.secure_url},
          id_back_image = ${idBackUploadResult.secure_url},
          selfie_image = ${selfieUploadResult.secure_url},
          verification_status = 'PENDING',
          verification_notes = 'Awaiting admin review',
          updated_at = NOW()
        WHERE id = ${session.user.id}
      `;

      console.log("Verification documents submitted successfully");
      return NextResponse.json(
        { message: "Verification documents submitted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error uploading images or updating user details:", error);
      return NextResponse.json(
        { error: "Failed to process verification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to process verification" },
      { status: 500 }
    );
  }
} 