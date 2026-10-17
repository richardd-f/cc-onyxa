import { prisma } from "@/lib/db/prisma";
import { calculatePeriodComparison } from "@/lib/utils";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  subDays,
  format,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

export type PeriodType = "this_week" | "last_week" | "this_month" | "last_month" | "last_3_months" | "custom";

export interface PeriodDates {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  periodLabel: string;
}

export function resolvePeriodDates(
  period: PeriodType = "this_month",
  customStart?: string,
  customEnd?: string
): PeriodDates {
  const now = new Date();

  if (period === "custom" && customStart && customEnd) {
    const cStart = new Date(customStart);
    const cEnd = new Date(customEnd);
    cEnd.setHours(23, 59, 59, 999);
    const diffMs = cEnd.getTime() - cStart.getTime();
    const pEnd = new Date(cStart.getTime() - 1);
    const pStart = new Date(pEnd.getTime() - diffMs);
    return {
      currentStart: cStart,
      currentEnd: cEnd,
      previousStart: pStart,
      previousEnd: pEnd,
      periodLabel: `${format(cStart, "MMM d")} - ${format(cEnd, "MMM d, yyyy")}`,
    };
  }

  if (period === "this_week") {
    const cStart = startOfWeek(now, { weekStartsOn: 1 });
    const cEnd = now;
    const pStart = subWeeks(cStart, 1);
    const pEnd = subWeeks(cEnd, 1);
    return {
      currentStart: cStart,
      currentEnd: cEnd,
      previousStart: pStart,
      previousEnd: pEnd,
      periodLabel: "This Week",
    };
  }

  if (period === "last_week") {
    const prevWeek = subWeeks(now, 1);
    const cStart = startOfWeek(prevWeek, { weekStartsOn: 1 });
    const cEnd = endOfWeek(prevWeek, { weekStartsOn: 1 });
    const pStart = subWeeks(cStart, 1);
    const pEnd = subWeeks(cEnd, 1);
    return {
      currentStart: cStart,
      currentEnd: cEnd,
      previousStart: pStart,
      previousEnd: pEnd,
      periodLabel: "Last Week",
    };
  }

  if (period === "last_month") {
    const prevMonth = subMonths(now, 1);
    const cStart = startOfMonth(prevMonth);
    const cEnd = endOfMonth(prevMonth);
    const pStart = startOfMonth(subMonths(cStart, 1));
    const pEnd = endOfMonth(subMonths(cStart, 1));
    return {
      currentStart: cStart,
      currentEnd: cEnd,
      previousStart: pStart,
      previousEnd: pEnd,
      periodLabel: format(prevMonth, "MMMM yyyy"),
    };
  }

  if (period === "last_3_months") {
    const cStart = subDays(now, 90);
    const cEnd = now;
    const pStart = subDays(cStart, 90);
    const pEnd = subDays(cEnd, 90);
    return {
      currentStart: cStart,
      currentEnd: cEnd,
      previousStart: pStart,
      previousEnd: pEnd,
      periodLabel: "Last 3 Months",
    };
  }

  // Default: this_month
  const cStart = startOfMonth(now);
  const cEnd = now;
  const pStart = startOfMonth(subMonths(now, 1));
  const daysIntoMonth = now.getDate();
  const pEnd = new Date(pStart);
  pEnd.setDate(Math.min(daysIntoMonth, new Date(pStart.getFullYear(), pStart.getMonth() + 1, 0).getDate()));
  pEnd.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

  return {
    currentStart: cStart,
    currentEnd: cEnd,
    previousStart: pStart,
    previousEnd: pEnd,
    periodLabel: "This Month",
  };
}

export async function getDashboardOverview(
  userId: string,
  period: PeriodType = "this_month",
  customStart?: string,
  customEnd?: string
) {
  const dates = resolvePeriodDates(period, customStart, customEnd);

  // 1. Current period transactions
  const currentTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: dates.currentStart,
        lte: dates.currentEnd,
      },
    },
    include: {
      merchant: true,
      category: true,
    },
    orderBy: { date: "desc" },
  });

  // 2. Previous period transactions
  const previousTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: dates.previousStart,
        lte: dates.previousEnd,
      },
    },
    select: { amount: true },
  });

  // 3. Spending metrics
  const currentTotal = currentTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const previousTotal = previousTransactions.reduce((acc, t) => acc + Number(t.amount), 0);
  const comparison = calculatePeriodComparison(currentTotal, previousTotal);

  const txCount = currentTransactions.length;
  const averageTxAmount = txCount > 0 ? currentTotal / txCount : 0;
  const mostExpensiveTx = currentTransactions.reduce<number>((max, t) => {
    const amt = Number(t.amount);
    return amt > max ? amt : max;
  }, 0);

  // 4. Daily spending trend for current period
  const trendInterval = eachDayOfInterval({
    start: dates.currentStart,
    end: dates.currentEnd,
  });

  const dailyTrend = trendInterval.map((day) => {
    const dayTotal = currentTransactions
      .filter((t) => isSameDay(t.date, day))
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      date: format(day, "MMM d"),
      amount: dayTotal,
    };
  });

  // 5. Category breakdown
  const categoryMap = new Map<string, { name: string; color: string; amount: number; count: number }>();
  for (const t of currentTransactions) {
    const catName = t.category?.name || "Uncategorized";
    const catColor = t.category?.color || "#94A3B8";
    const amt = Number(t.amount);

    const existing = categoryMap.get(catName);
    if (existing) {
      existing.amount += amt;
      existing.count += 1;
    } else {
      categoryMap.set(catName, { name: catName, color: catColor, amount: amt, count: 1 });
    }
  }

  const categoryBreakdown = Array.from(categoryMap.values())
    .map((c) => ({
      ...c,
      percentage: currentTotal > 0 ? Number(((c.amount / currentTotal) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 6. Merchant breakdown
  const merchantMap = new Map<string, { name: string; amount: number; count: number }>();
  for (const t of currentTransactions) {
    const mName = t.merchant?.displayName || "Direct / Unknown";
    const amt = Number(t.amount);

    const existing = merchantMap.get(mName);
    if (existing) {
      existing.amount += amt;
      existing.count += 1;
    } else {
      merchantMap.set(mName, { name: mName, amount: amt, count: 1 });
    }
  }

  const merchantBreakdown = Array.from(merchantMap.values())
    .map((m) => ({
      ...m,
      percentage: currentTotal > 0 ? Number(((m.amount / currentTotal) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 7. Recent transactions (5)
  const recentTransactions = currentTransactions.slice(0, 5).map((t) => ({
    id: t.id,
    merchantName: t.merchant?.displayName || "Direct Payment",
    categoryName: t.category?.name || "Uncategorized",
    categoryColor: t.category?.color || "#94A3B8",
    amount: Number(t.amount),
    currency: t.currency,
    date: t.date,
    source: t.source,
    paymentMethod: t.paymentMethod,
  }));

  return {
    period: dates.periodLabel,
    currentTotal,
    previousTotal,
    comparison,
    txCount,
    averageTxAmount,
    mostExpensiveTx,
    dailyTrend,
    categoryBreakdown,
    merchantBreakdown,
    topCategories: categoryBreakdown.slice(0, 5),
    topMerchants: merchantBreakdown.slice(0, 5),
    recentTransactions,
  };
}
