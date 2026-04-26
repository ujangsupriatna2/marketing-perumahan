import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_SIZE = 300 * 1024; // 300KB
const BUCKET_NAME = "uploads";
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
];

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function generateFilename(ext: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const format = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpeg";

  // Try initial compression
  let result = await sharp(buffer)
    .rotate()
    .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
    [format]({ quality: 85, mozjpeg: format === "jpeg" })
    .toBuffer();

  // If still too large, progressively reduce quality
  if (result.length > MAX_SIZE) {
    for (let q = 70; q >= 20; q -= 10) {
      result = await sharp(buffer)
        .rotate()
        .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
        [format]({ quality: q, mozjpeg: format === "jpeg" })
        .toBuffer();
      if (result.length <= MAX_SIZE) break;
    }
  }

  // If still too large, resize dimensions
  if (result.length > MAX_SIZE) {
    for (let width = 1600; width >= 600; width -= 200) {
      result = await sharp(buffer)
        .rotate()
        .resize(width, null, { withoutEnlargement: true, fit: "inside" })
        [format]({ quality: 60, mozjpeg: format === "jpeg" })
        .toBuffer();
      if (result.length <= MAX_SIZE) break;
    }
  }

  // Final fallback: force small
  if (result.length > MAX_SIZE) {
    result = await sharp(buffer)
      .rotate()
      .resize(800, 600, { withoutEnlargement: true, fit: "inside" })
      .jpeg({ quality: 50 })
      .toBuffer();
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 5242880, // 5MB raw file limit (before compression)
      });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compress image (max 300KB)
    const compressedBuffer = await compressImage(buffer, file.type);

    // Determine final extension
    const isPng = file.type === "image/png" && compressedBuffer.length <= MAX_SIZE;
    const isWebp = file.type === "image/webp" && compressedBuffer.length <= MAX_SIZE;
    const finalExt = isPng ? "png" : isWebp ? "webp" : "jpg";

    const filename = generateFilename(finalExt);
    const contentType = isPng ? "image/png" : isWebp ? "image/webp" : "image/jpeg";

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, compressedBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Upload Error] Supabase:", uploadError);
      return NextResponse.json({ error: "Gagal mengupload ke storage" }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filename);
    const publicUrl = urlData.publicUrl;

    const originalSizeKB = (buffer.length / 1024).toFixed(1);
    const compressedSizeKB = (compressedBuffer.length / 1024).toFixed(1);
    const savedPercent = ((1 - compressedBuffer.length / buffer.length) * 100).toFixed(0);

    console.log(
      `[Upload] ${filename} — ${originalSizeKB}KB → ${compressedSizeKB}KB (${savedPercent}% saved)`
    );

    return NextResponse.json({
      url: publicUrl,
      filename,
      originalSize: buffer.length,
      compressedSize: compressedBuffer.length,
    });
  } catch (error) {
    console.error("[Upload Error]", error);
    return NextResponse.json({ error: "Gagal mengupload gambar" }, { status: 500 });
  }
}
