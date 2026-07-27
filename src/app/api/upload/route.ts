import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ok, err } from "@/lib/api";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);

  const formData = await req.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    const single = formData.get("file");
    if (single instanceof File) files.push(single);
  }
  if (files.length === 0) return err("No files uploaded", 422);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const uploaded: { url: string; filename: string; mimeType: string; size: number }[] = [];
  for (const file of files) {
    const ext = path.extname(file.name) || ".png";
    const safeExt = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext.toLowerCase()) ? ext.toLowerCase() : ".png";
    const filename = `${randomUUID()}${safeExt}`;
    const filepath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);
    const url = `/uploads/${filename}`;
    uploaded.push({ url, filename: file.name, mimeType: file.type, size: file.size });

    await db.mediaAsset.create({
      data: { url, filename: file.name, mimeType: file.type, size: file.size, uploadedById: user.id },
    });
  }

  return ok({ files: uploaded });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err("Unauthorized", 401);
  const media = await db.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return ok({ media });
}
