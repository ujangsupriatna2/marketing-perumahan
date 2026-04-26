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
    const mitraIdFilter = searchParams.get("mitraId") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = { ...getMitraWhere(user, mitraIdFilter) };

    const [items, total] = await Promise.all([
      db.bank.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          mitra: { select: { id: true, name: true } },
        },
      }),
      db.bank.count({ where }),
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
    const { name, description, image, sortOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama bank wajib diisi" }, { status: 400 });
    }

    const mitraId = user.role === "superadmin" ? (body.mitraId || null) : user.mitraId;

    const item = await db.bank.create({
      data: {
        name,
        description: description || "",
        image: image || "",
        sortOrder: parseInt(sortOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        mitraId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
