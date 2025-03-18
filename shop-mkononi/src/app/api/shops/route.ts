import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: any = {};

    if (category) {
      where.categoryId = category;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.products = {
        some: {
          price: {
            gte: minPrice ? parseFloat(minPrice) : undefined,
            lte: maxPrice ? parseFloat(maxPrice) : undefined,
          },
        },
      };
    }

    const shops = await prisma.shop.findMany({
      where,
      include: {
        category: true,
        products: {
          select: {
            id: true,
            price: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 12, // Limit to 12 shops per page
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, description, categoryId, location } = data;

    // Create URL-friendly slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        description,
        categoryId,
        location,
        sellerId: session.user.id,
      },
      include: {
        category: true,
        seller: {
          select: {
            name: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error creating shop:", error);
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 }
    );
  }
} 