import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { processReceiptUpload } from "@/features/receipts/services/receipt.service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ocrProvider = formData.get("ocrProvider") as "ocr-space" | "tesseract" | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload JPEG, PNG, WEBP, or PDF." },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
    }

    const receipt = await processReceiptUpload(user.id, file, ocrProvider || undefined);

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    console.error("Receipt upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload processing failed" },
      { status: 500 }
    );
  }
}
