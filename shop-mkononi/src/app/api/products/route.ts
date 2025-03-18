import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const shopId = searchParams.get("shopId");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where = {
      isActive: true,
      ...(category && { category: { name: category } }),
      ...(shopId && { shopId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        category: true,
        shop: {
          select: {
            name: true,
            location: true,
            seller: {
              select: {
                name: true,
                isVerified: true,
              },
            },
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      name,
      description,
      price,
      categoryId,
      shopId,
      images,
      stock,
      condition,
      deliveryMethods,
    } = data;

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { sellerId: true },
    });

    if (!shop || shop.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        categoryId,
        shopId,
        stock,
        condition,
        deliveryMethods,
        images: {
          create: images.map((url: string) => ({ url })),
        },
      },
      include: {
        images: true,
        category: true,
        shop: {
          select: {
            name: true,
            location: true,
            seller: {
              select: {
                name: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
} 