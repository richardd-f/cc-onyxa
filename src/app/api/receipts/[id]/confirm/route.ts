import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { confirmReceiptTransaction } from "@/features/receipts/services/receipt.service";
import { confirmReceiptSchema } from "@/features/receipts/schemas/receipt.schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const parsed = confirmReceiptSchema.safeParse({
      ...body,
      receiptId: id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid transaction details" },
        { status: 400 }
      );
    }

    const transaction = await confirmReceiptTransaction(user.id, parsed.data);

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    console.error("Receipt confirmation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Confirmation failed" },
      { status: 500 }
    );
  }
}
