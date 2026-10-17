"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Store,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface AnalyticsViewProps {
  analytics: {
    periodLabel: string;
    currentTotal: number;
    previousTotal: number;
    totalComparison: {
      absoluteDiff: number;
      percentageChange: number | null;
      isIncrease: boolean;
    };
    currentCount: number;
    previousCount: number;
    countComparison: {
      percentageChange: number | null;
      isIncrease: boolean;
    };
    currentAvg: number;
    previousAvg: number;
    avgComparison: {
      percentageChange: number | null;
      isIncrease: boolean;
    };
    categoryComparisons: Array<{
      categoryName: string;
      color: string;
      currentAmount: number;
      previousAmount: number;
      comparison: {
        absoluteDiff: number;
        percentageChange: number | null;
        isIncrease: boolean;
      };
    }>;
    merchantComparisons: Array<{
      merchantName: string;
      currentAmount: number;
      previousAmount: number;
      comparison: {
        absoluteDiff: number;
        percentageChange: number | null;
        isIncrease: boolean;
      };
    }>;
  };
  habits: {
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
  };
  currentPeriod: string;
  currency?: string;
}

export function AnalyticsView({
  analytics,
  habits,
  currentPeriod,
  currency = "USD",
}: AnalyticsViewProps) {
  const router = useRouter();

  const handlePeriodChange = (p: string) => {
    router.push(`/analytics?period=${p}`);
  };

  const periodOptions = [
    { label: "This Week vs Last Week", value: "this_week" },
    { label: "This Month vs Last Month", value: "this_month" },
    { label: "Last 3 Months vs Prior", value: "last_3_months" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Spending Trend & Habit Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative period metrics and deterministic behavioral intelligence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePeriodChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                currentPeriod === opt.value
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Period Comparison Metrics - Pure Flexbox Cards */}
      <div className="flex flex-wrap gap-4 w-full">
        {/* Total Spend Comparison */}
        <Card className="flex-1 min-w-[240px] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Spending Comparison
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(analytics.currentTotal, currency)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-slate-400">vs prev {formatCurrency(analytics.previousTotal, currency)}:</span>
            {analytics.totalComparison.percentageChange !== null ? (
              <span
                className={`font-semibold flex items-center ${
                  analytics.totalComparison.isIncrease ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {analytics.totalComparison.isIncrease ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {Math.abs(analytics.totalComparison.percentageChange)}%
              </span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </Card>

        {/* Transaction Count Comparison */}
        <Card className="flex-1 min-w-[240px] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Transaction Frequency
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {analytics.currentCount}
            </span>
            <span className="text-xs text-slate-400">transactions</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-slate-400">vs prev {analytics.previousCount}:</span>
            {analytics.countComparison.percentageChange !== null ? (
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {analytics.countComparison.isIncrease ? "+" : ""}
                {analytics.countComparison.percentageChange}%
              </span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </Card>

        {/* Average Transaction Comparison */}
        <Card className="flex-1 min-w-[240px] p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Spend Size
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(analytics.currentAvg, currency)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-slate-400">vs prev {formatCurrency(analytics.previousAvg, currency)}:</span>
            {analytics.avgComparison.percentageChange !== null ? (
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {analytics.avgComparison.isIncrease ? "+" : ""}
                {analytics.avgComparison.percentageChange}%
              </span>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </Card>
      </div>

      {/* SECTION 2: Category Comparison Table & Breakdown */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Category Spending Comparison</CardTitle>
          <p className="text-xs text-slate-400">
            Compare category shifts between current and preceding periods
          </p>
        </CardHeader>
        <CardContent className="p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {analytics.categoryComparisons.map((cat) => (
            <div
              key={cat.categoryName}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2 sm:gap-0"
            >
              <div className="flex items-center gap-3 sm:w-4/12">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {cat.categoryName}
                </span>
              </div>

              <div className="sm:w-3/12 flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Current</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(cat.currentAmount, currency)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Previous</span>
                  <span className="text-slate-500">
                    {formatCurrency(cat.previousAmount, currency)}
                  </span>
                </div>
              </div>

              <div className="sm:w-3/12 text-left sm:text-right">
                <span
                  className={`inline-flex items-center text-xs font-bold ${
                    cat.comparison.isIncrease ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {cat.comparison.isIncrease ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                  )}
                  {cat.comparison.percentageChange !== null
                    ? `${Math.abs(cat.comparison.percentageChange)}%`
                    : "New"}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {formatCurrency(Math.abs(cat.comparison.absoluteDiff), currency)} diff
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SECTION 3: Deterministic Spending Habit Detection */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Detected Spending Habits
            </h3>
            <Badge variant="purple">Deterministic Analysis</Badge>
          </div>
          {!habits.hasSufficientData && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/60 dark:border-amber-900/40">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Limited historical transactions ({habits.totalTransactionsAnalyzed})</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Habit 1: Day of Week Distribution Chart */}
          <Card className="w-full lg:w-7/12 p-6 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Spending by Day of the Week</CardTitle>
              <p className="text-xs text-slate-400">
                Average transaction volume across weekdays vs weekends
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[220px]">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={habits.weekdaySpending} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`, "Total"]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {habits.weekdaySpending.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 || index === 6 ? "#F59E0B" : "#10B981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Habit 2: Recurring Merchants & Items */}
          <Card className="w-full lg:w-5/12 p-6 flex flex-col gap-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle>Frequent Merchants & Items</CardTitle>
              <p className="text-xs text-slate-400">
                Most repeated purchase destinations & parsed line items
              </p>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-4">
              {/* Top frequent merchants */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Most Visited Merchants
                </span>
                {habits.frequentMerchants.slice(0, 3).map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {m.name}
                      </span>
                    </div>
                    <span className="text-slate-500 font-medium">
                      {m.visitCount} visits ({formatCurrency(m.totalSpent, currency)})
                    </span>
                  </div>
                ))}
              </div>

              {/* Top frequent items */}
              {habits.frequentItems.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Repeated Line Items
                  </span>
                  {habits.frequentItems.slice(0, 3).map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        {item.purchaseCount}× ({formatCurrency(item.totalSpent, currency)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
