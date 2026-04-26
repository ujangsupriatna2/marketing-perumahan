import { NextResponse } from "next/server";
import { getAuthSession, getMitraWhere } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "";
    const mitraIdFilter = searchParams.get("mitraId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { ...getMitraWhere(user, mitraIdFilter) };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      db.galleryItem.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          mitra: { select: { id: true, name: true } },
        },
      }),
      db.galleryItem.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, image, description, sortOrder } = body;

    if (!title || !image) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 });
    }

    const mitraId = user.role === "superadmin" ? (body.mitraId || null) : user.mitraId;

    const item = await db.galleryItem.create({
      data: {
        title,
        category: category || "",
        image,
        description: description || "",
        sortOrder: parseInt(sortOrder) || 0,
        mitraId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
