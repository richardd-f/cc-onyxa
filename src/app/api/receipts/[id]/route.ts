import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getReceiptById, deleteReceipt } from "@/features/receipts/services/receipt.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const receipt = await getReceiptById(user.id, id);

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json({ receipt });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve receipt" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await deleteReceipt(user.id, id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete receipt" }, { status: 500 });
  }
}
