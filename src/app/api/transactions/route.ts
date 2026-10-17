import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  listTransactions,
  createTransaction,
} from "@/features/transactions/services/transaction.service";
import {
  createTransactionSchema,
  transactionFilterSchema,
} from "@/features/transactions/schemas/transaction.schema";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    const filters = transactionFilterSchema.parse({
      ...searchParams,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
    });

    const result = await listTransactions(user.id, filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("List transactions API error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid transaction data" },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(user.id, parsed.data);

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error("Create transaction API error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
