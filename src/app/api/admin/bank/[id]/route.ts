import { NextResponse } from "next/server";
import { getAuthSession, canAccessMitra } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await db.bank.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Bank tidak ditemukan" }, { status: 404 });
    }

    if (!canAccessMitra(user, item.mitraId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await db.bank.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bank tidak ditemukan" }, { status: 404 });
    }

    if (!canAccessMitra(user, existing.mitraId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    const fields = ["name", "description", "image"];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const item = await db.bank.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.bank.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bank tidak ditemukan" }, { status: 404 });
    }

    if (!canAccessMitra(user, existing.mitraId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.bank.delete({ where: { id } });
    return NextResponse.json({ message: "Bank berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
