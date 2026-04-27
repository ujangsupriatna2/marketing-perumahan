import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const mitra = await db.mitra.findUnique({
      where: { id },
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
    });

    if (!mitra) {
      return NextResponse.json({ error: "Mitra tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ mitra });
  } catch (error) {
    console.error("GET /api/admin/mitra/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const mitra = await db.mitra.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        subdomain: body.subdomain,
        logo: body.logo,
        description: body.description,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        primaryColor: body.primaryColor,
        accentColor: body.accentColor,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ mitra });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug atau subdomain sudah digunakan" }, { status: 400 });
    }
    console.error("PUT /api/admin/mitra/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await db.mitra.delete({ where: { id } });

    return NextResponse.json({ message: "Mitra berhasil dihapus" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Tidak bisa hapus mitra yang masih memiliki data (properti, blog, dll). Hapus data terlebih dahulu atau cabut admin dari mitra ini." },
        { status: 400 }
      );
    }
    console.error("DELETE /api/admin/mitra/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
