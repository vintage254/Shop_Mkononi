import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const skip = Number(searchParams.get("skip") || "0");
    
    try {
      // Build the where clause
      const where: any = {};
      if (category) {
        where.category = category;
      }
      if (query) {
        where.name = { contains: query, mode: 'insensitive' };
      }
      
      // Use Prisma ORM with proper type safety
      const shops = await prisma.shop.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          sellerId: true,
          logoUrl: true,
          bannerUrl: true,
          primaryColor: true,
          secondaryColor: true,
          accentColor: true,
          fontFamily: true,
          themeId: true,
          layoutConfig: true,
          customCSS: true,
          transportOptions: true,
          createdAt: true,
          updatedAt: true,
          seller: {
            select: {
              id: true,
              name: true,
              isVerified: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 12,
        skip
      });
      
      return NextResponse.json({ shops });
    } catch (error) {
      console.error("Error fetching shops:", error);
      return NextResponse.json(
        { error: "Error fetching shops", shops: [] },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in shops API:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SELLER") {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    const body = await request.json();
    
    try {
      // Extract data from body with defaults
      const {
        name,
        description = '',
        slug,
        logoUrl = null,
        bannerUrl = null,
        primaryColor = '#000000',
        secondaryColor = '#ffffff',
        accentColor = '#0070f3',
        fontFamily = 'sans-serif',
        themeId = 'default',
        layoutConfig = '{}',
        customCSS = '',
        transportOptions = '[]'
      } = body;
      
      // Create shop with Prisma ORM
      const shop = await prisma.shop.create({
        data: {
          name,
          description,
          slug,
          sellerId: session.user.id,
          logoUrl,
          bannerUrl,
          primaryColor,
          secondaryColor,
          accentColor,
          fontFamily,
          themeId,
          layoutConfig,
          customCSS,
          transportOptions
        }
      });
      
      return NextResponse.json(shop, { status: 201 });
    } catch (error) {
      console.error("Error creating shop:", error);
      return NextResponse.json(
        { error: "Failed to create shop" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in creating shop:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}