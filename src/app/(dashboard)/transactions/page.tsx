import { requireAuth } from "@/lib/auth/session";
import { listTransactions } from "@/features/transactions/services/transaction.service";
import { getUserCategories } from "@/features/categories/services/category.service";
import { TransactionsView } from "@/features/transactions/components/transactions-view";
import { transactionFilterSchema } from "@/features/transactions/schemas/transaction.schema";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireAuth();
  const rawParams = await searchParams;

  const filters = transactionFilterSchema.parse({
    search: rawParams.search,
    categoryId: rawParams.categoryId,
    paymentMethod: rawParams.paymentMethod,
    source: rawParams.source,
    startDate: rawParams.startDate,
    endDate: rawParams.endDate,
    sortBy: rawParams.sortBy || "date",
    sortOrder: rawParams.sortOrder || "desc",
    page: rawParams.page ? parseInt(rawParams.page) : 1,
    limit: rawParams.limit ? parseInt(rawParams.limit) : 10,
  });

  const [{ transactions, pagination }, categories] = await Promise.all([
    listTransactions(user.id, filters),
    getUserCategories(user.id),
  ]);

  return (
    <TransactionsView
      initialTransactions={transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        items: t.items.map((i) => ({
          ...i,
          quantity: i.quantity ? Number(i.quantity) : null,
          unitPrice: i.unitPrice ? Number(i.unitPrice) : null,
          totalPrice: i.totalPrice ? Number(i.totalPrice) : null,
        })),
      }))}
      pagination={pagination}
      categories={categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
      currency={user.currency || "USD"}
    />
  );
}
