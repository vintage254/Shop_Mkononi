import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        products: {
          where: { isActive: true },
          include: {
            images: true,
            reviews: {
              select: {
                rating: true,
              },
            },
          },
        },
        seller: {
          select: {
            name: true,
            isVerified: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error fetching shop:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      select: { sellerId: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.sellerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedShop = await prisma.shop.update({
      where: { id: params.id },
      data,
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

    return NextResponse.json(updatedShop);
  } catch (error) {
    console.error("Error updating shop:", error);
    return NextResponse.json(
      { error: "Failed to update shop" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      select: { sellerId: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.sellerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.shop.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    return NextResponse.json(
      { error: "Failed to delete shop" },
      { status: 500 }
    );
  }
} 