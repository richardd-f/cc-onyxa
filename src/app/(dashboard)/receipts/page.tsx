import { requireAuth } from "@/lib/auth/session";
import { getUserReceipts } from "@/features/receipts/services/receipt.service";
import { ReceiptsView } from "@/features/receipts/components/receipts-view";

export default async function ReceiptsPage() {
  const user = await requireAuth();
  const receipts = await getUserReceipts(user.id);

  return (
    <ReceiptsView
      initialReceipts={receipts.map((r) => ({
        ...r,
        transaction: r.transaction
          ? {
              ...r.transaction,
              amount: Number(r.transaction.amount),
            }
          : null,
      }))}
      currency={user.currency || "USD"}
    />
  );
}
