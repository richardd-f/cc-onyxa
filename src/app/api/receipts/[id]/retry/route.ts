import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { retryReceiptProcessing } from "@/features/receipts/services/receipt.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const receipt = await retryReceiptProcessing(user.id, id);

    return NextResponse.json({ success: true, receipt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Retry processing failed" },
      { status: 500 }
    );
  }
}
