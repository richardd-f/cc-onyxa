import { requireAuth } from "@/lib/auth/session";
import { getUserMerchantsWithStats } from "@/features/merchants/services/merchant.service";
import { MerchantsView } from "@/features/merchants/components/merchants-view";

export default async function MerchantsPage() {
  const user = await requireAuth();
  const merchants = await getUserMerchantsWithStats(user.id);

  return (
    <MerchantsView
      initialMerchants={merchants.map((m) => ({
        ...m,
        recentTransactions: m.recentTransactions.map((tx) => ({
          ...tx,
          amount: Number(tx.amount),
        })),
      }))}
      currency={user.currency || "USD"}
    />
  );
}
