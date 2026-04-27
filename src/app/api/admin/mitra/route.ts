import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { subdomain: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [mitra, total] = await Promise.all([
      db.mitra.findMany({
        where,
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              admins: true,
              properties: true,
              blogPosts: true,
              testimonials: true,
              galleryItems: true,
              banks: true,
            },
          },
        },
      }),
      db.mitra.count({ where }),
    ]);

    return NextResponse.json({ mitra, total, page, limit });
  } catch (error) {
    console.error("GET /api/admin/mitra error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, subdomain, logo, description, address, phone, email, website, primaryColor, accentColor } = body;

    if (!name || !slug || !subdomain) {
      return NextResponse.json({ error: "Name, slug, dan subdomain wajib diisi" }, { status: 400 });
    }

    // Check unique
    const existing = await db.mitra.findFirst({
      where: { OR: [{ slug }, { subdomain }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Slug atau subdomain "${slug}/${subdomain}" sudah digunakan` },
        { status: 400 }
      );
    }

    const mitra = await db.mitra.create({
      data: {
        name,
        slug,
        subdomain,
        logo: logo || "",
        description: description || "",
        address: address || "",
        phone: phone || "",
        email: email || "",
        website: website || "",
        primaryColor: primaryColor || "#dc2626",
        accentColor: accentColor || "#f59e0b",
      },
    });

    return NextResponse.json({ mitra }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/mitra error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
