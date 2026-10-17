import { prisma } from "@/lib/db/prisma";
import { resolvePeriodDates, PeriodType } from "@/features/dashboard/services/dashboard.service";
import { calculatePeriodComparison, PeriodComparisonResult } from "@/lib/utils";

export interface CategoryComparison {
  categoryName: string;
  color: string;
  currentAmount: number;
  previousAmount: number;
  comparison: PeriodComparisonResult;
}

export interface MerchantComparison {
  merchantName: string;
  currentAmount: number;
  previousAmount: number;
  comparison: PeriodComparisonResult;
}

export interface DetailedAnalyticsResult {
  periodLabel: string;
  currentTotal: number;
  previousTotal: number;
  totalComparison: PeriodComparisonResult;
  currentCount: number;
  previousCount: number;
  countComparison: PeriodComparisonResult;
  currentAvg: number;
  previousAvg: number;
  avgComparison: PeriodComparisonResult;
  categoryComparisons: CategoryComparison[];
  merchantComparisons: MerchantComparison[];
}

export async function getDetailedAnalytics(
  userId: string,
  period: PeriodType = "this_month",
  customStart?: string,
  customEnd?: string
): Promise<DetailedAnalyticsResult> {
  const dates = resolvePeriodDates(period, customStart, customEnd);

  // Fetch current period transactions
  const currentTxs = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: dates.currentStart, lte: dates.currentEnd },
    },
    include: { category: true, merchant: true },
  });

  // Fetch previous period transactions
  const previousTxs = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: dates.previousStart, lte: dates.previousEnd },
    },
    include: { category: true, merchant: true },
  });

  // Total amounts
  const currentTotal = currentTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const previousTotal = previousTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalComparison = calculatePeriodComparison(currentTotal, previousTotal);

  // Counts
  const currentCount = currentTxs.length;
  const previousCount = previousTxs.length;
  const countComparison = calculatePeriodComparison(currentCount, previousCount);

  // Averages
  const currentAvg = currentCount > 0 ? currentTotal / currentCount : 0;
  const previousAvg = previousCount > 0 ? previousTotal / previousCount : 0;
  const avgComparison = calculatePeriodComparison(currentAvg, previousAvg);

  // Category comparisons
  const categoryMap = new Map<string, { name: string; color: string; current: number; previous: number }>();

  for (const t of currentTxs) {
    const name = t.category?.name || "Uncategorized";
    const color = t.category?.color || "#94A3B8";
    const amt = Number(t.amount);
    const existing = categoryMap.get(name);
    if (existing) {
      existing.current += amt;
    } else {
      categoryMap.set(name, { name, color, current: amt, previous: 0 });
    }
  }

  for (const t of previousTxs) {
    const name = t.category?.name || "Uncategorized";
    const color = t.category?.color || "#94A3B8";
    const amt = Number(t.amount);
    const existing = categoryMap.get(name);
    if (existing) {
      existing.previous += amt;
    } else {
      categoryMap.set(name, { name, color, current: 0, previous: amt });
    }
  }

  const categoryComparisons: CategoryComparison[] = Array.from(categoryMap.values())
    .map((c) => ({
      categoryName: c.name,
      color: c.color,
      currentAmount: c.current,
      previousAmount: c.previous,
      comparison: calculatePeriodComparison(c.current, c.previous),
    }))
    .sort((a, b) => b.currentAmount - a.currentAmount);

  // Merchant comparisons
  const merchantMap = new Map<string, { name: string; current: number; previous: number }>();

  for (const t of currentTxs) {
    const name = t.merchant?.displayName || "Direct / Unknown";
    const amt = Number(t.amount);
    const existing = merchantMap.get(name);
    if (existing) {
      existing.current += amt;
    } else {
      merchantMap.set(name, { name, current: amt, previous: 0 });
    }
  }

  for (const t of previousTxs) {
    const name = t.merchant?.displayName || "Direct / Unknown";
    const amt = Number(t.amount);
    const existing = merchantMap.get(name);
    if (existing) {
      existing.previous += amt;
    } else {
      merchantMap.set(name, { name, current: 0, previous: amt });
    }
  }

  const merchantComparisons: MerchantComparison[] = Array.from(merchantMap.values())
    .map((m) => ({
      merchantName: m.name,
      currentAmount: m.current,
      previousAmount: m.previous,
      comparison: calculatePeriodComparison(m.current, m.previous),
    }))
    .sort((a, b) => b.currentAmount - a.currentAmount)
    .slice(0, 10);

  return {
    periodLabel: dates.periodLabel,
    currentTotal,
    previousTotal,
    totalComparison,
    currentCount,
    previousCount,
    countComparison,
    currentAvg,
    previousAvg,
    avgComparison,
    categoryComparisons,
    merchantComparisons,
  };
}
