import { prisma } from "@/lib/db/prisma";

export function normalizeMerchantName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[#\d]+.*$/, "") // remove store numbers like #1234
    .replace(/[^a-z0-9\s]/g, "") // remove punctuation
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 50);
}

export function formatMerchantDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "Unknown Merchant";
  // Capitalize words nicely
  return trimmed
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function findOrCreateMerchant(userId: string, rawName: string) {
  const normalized = normalizeMerchantName(rawName) || "unknown";
  const display = formatMerchantDisplayName(rawName);

  let merchant = await prisma.merchant.findUnique({
    where: {
      userId_normalizedName: {
        userId,
        normalizedName: normalized,
      },
    },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        userId,
        normalizedName: normalized,
        displayName: display,
      },
    });
  }

  return merchant;
}

export async function getUserMerchantsWithStats(userId: string) {
  const merchants = await prisma.merchant.findMany({
    where: { userId },
    include: {
      transactions: {
        select: {
          id: true,
          amount: true,
          date: true,
          category: {
            select: { name: true, color: true },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  return merchants
    .map((m) => {
      const txCount = m.transactions.length;
      const totalSpent = m.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const avgSpent = txCount > 0 ? totalSpent / txCount : 0;
      const lastPurchase = m.transactions[0]?.date || null;

      return {
        id: m.id,
        displayName: m.displayName,
        normalizedName: m.normalizedName,
        transactionCount: txCount,
        totalSpent,
        averageSpent: avgSpent,
        lastPurchase,
        recentTransactions: m.transactions.slice(0, 5),
      };
    })
    .sort((a, b) => b.totalSpent - a.totalSpent);
}
