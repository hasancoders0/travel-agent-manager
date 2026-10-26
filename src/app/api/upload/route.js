import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isValidImageSignature(buffer, extension) {
  switch (extension) {
    case "jpg":
      return (
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );

    case "png":
      return (
        buffer.length >= 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      );

    case "webp":
      return (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );

    case "gif":
      return (
        buffer.length >= 6 &&
        ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6))
      );

    default:
      return false;
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Please select an image." },
        { status: 400 },
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Use a JPG, PNG, WebP or GIF image." },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected image is empty." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be 2 MB or smaller." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());

    if (!isValidImageSignature(bytes, extension)) {
      return NextResponse.json(
        { error: "The uploaded file is not a valid image." },
        { status: 400 },
      );
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDirectory, { recursive: true });

    const filename = `${randomUUID()}.${extension}`;
    const filePath = path.join(uploadDirectory, filename);

    await writeFile(filePath, bytes, { flag: "wx" });

    return NextResponse.json(
      {
        success: true,
        url: `/uploads/${filename}`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Image upload failed:", error);

    return NextResponse.json(
      { error: "Unable to upload the image. Please try again." },
      { status: 500 },
    );
  }
}
