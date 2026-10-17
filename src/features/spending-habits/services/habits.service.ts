import { prisma } from "@/lib/db/prisma";
import { getDay, subDays } from "date-fns";

export interface SpendingHabitSummary {
  frequentMerchants: Array<{
    name: string;
    visitCount: number;
    totalSpent: number;
    avgPerVisit: number;
  }>;
  topSpendMerchants: Array<{
    name: string;
    totalSpent: number;
    txCount: number;
  }>;
  frequentCategories: Array<{
    name: string;
    count: number;
    totalSpent: number;
    color: string;
  }>;
  frequentItems: Array<{
    name: string;
    purchaseCount: number;
    totalSpent: number;
  }>;
  weekdaySpending: Array<{
    day: string;
    amount: number;
    txCount: number;
    average: number;
  }>;
  weekendVsWeekday: {
    weekdayTotal: number;
    weekendTotal: number;
    weekdayAvgDaily: number;
    weekendAvgDaily: number;
    weekendHigher: boolean;
  };
  hasSufficientData: boolean;
  totalTransactionsAnalyzed: number;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function detectSpendingHabits(userId: string): Promise<SpendingHabitSummary> {
  // Analyze past 60 days
  const startDate = subDays(new Date(), 60);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    include: {
      merchant: true,
      category: true,
      items: true,
    },
    orderBy: { date: "desc" },
  });

  const totalTransactions = transactions.length;
  const hasSufficientData = totalTransactions >= 5;

  // 1. Merchant frequency & spend
  const merchantStats = new Map<string, { name: string; visits: number; total: number }>();
  for (const tx of transactions) {
    const name = tx.merchant?.displayName || "Direct Merchant";
    const amt = Number(tx.amount);
    const existing = merchantStats.get(name);
    if (existing) {
      existing.visits += 1;
      existing.total += amt;
    } else {
      merchantStats.set(name, { name, visits: 1, total: amt });
    }
  }

  const frequentMerchants = Array.from(merchantStats.values())
    .map((m) => ({
      name: m.name,
      visitCount: m.visits,
      totalSpent: m.total,
      avgPerVisit: m.total / m.visits,
    }))
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 6);

  const topSpendMerchants = Array.from(merchantStats.values())
    .map((m) => ({
      name: m.name,
      totalSpent: m.total,
      txCount: m.visits,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 6);

  // 2. Category frequency
  const catStats = new Map<string, { name: string; count: number; total: number; color: string }>();
  for (const tx of transactions) {
    const name = tx.category?.name || "Uncategorized";
    const color = tx.category?.color || "#94A3B8";
    const amt = Number(tx.amount);
    const existing = catStats.get(name);
    if (existing) {
      existing.count += 1;
      existing.total += amt;
    } else {
      catStats.set(name, { name, count: 1, total: amt, color });
    }
  }

  const frequentCategories = Array.from(catStats.values())
    .map((c) => ({
      name: c.name,
      count: c.count,
      totalSpent: c.total,
      color: c.color,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 3. Frequent items
  const itemStats = new Map<string, { name: string; count: number; total: number }>();
  for (const tx of transactions) {
    for (const item of tx.items) {
      const name = item.name.trim();
      const price = item.totalPrice ? Number(item.totalPrice) : 0;
      const existing = itemStats.get(name);
      if (existing) {
        existing.count += 1;
        existing.total += price;
      } else {
        itemStats.set(name, { name, count: 1, total: price });
      }
    }
  }

  const frequentItems = Array.from(itemStats.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((i) => ({
      name: i.name,
      purchaseCount: i.count,
      totalSpent: i.total,
    }));

  // 4. Day of the week analysis (0=Sunday, 1=Monday... 6=Saturday)
  const dayBuckets = Array.from({ length: 7 }, (_, i) => ({
    day: DAY_NAMES[i],
    amount: 0,
    txCount: 0,
    average: 0,
  }));

  let weekdayTotal = 0;
  let weekendTotal = 0;
  let weekdayTx = 0;
  let weekendTx = 0;

  for (const tx of transactions) {
    const dayIdx = getDay(tx.date);
    const amt = Number(tx.amount);
    dayBuckets[dayIdx].amount += amt;
    dayBuckets[dayIdx].txCount += 1;

    if (dayIdx === 0 || dayIdx === 6) {
      weekendTotal += amt;
      weekendTx += 1;
    } else {
      weekdayTotal += amt;
      weekdayTx += 1;
    }
  }

  dayBuckets.forEach((b) => {
    b.average = b.txCount > 0 ? b.amount / b.txCount : 0;
  });

  return {
    frequentMerchants,
    topSpendMerchants,
    frequentCategories,
    frequentItems,
    weekdaySpending: dayBuckets,
    weekendVsWeekday: {
      weekdayTotal,
      weekendTotal,
      weekdayAvgDaily: weekdayTx > 0 ? weekdayTotal / 5 : 0,
      weekendAvgDaily: weekendTx > 0 ? weekendTotal / 2 : 0,
      weekendHigher: weekendTx > 0 && weekdayTx > 0 ? weekendTotal / 2 > weekdayTotal / 5 : false,
    },
    hasSufficientData,
    totalTransactionsAnalyzed: totalTransactions,
  };
}
