"use client";

import * as React from "react";
import {
  DollarSign,
  Receipt,
  CreditCard,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useReceiptModal } from "@/features/receipts/context/receipt-modal-context";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardData {
  period: string;
  currentTotal: number;
  previousTotal: number;
  comparison: {
    absoluteDiff: number;
    percentageChange: number | null;
    isIncrease: boolean;
    hasPreviousData: boolean;
  };
  txCount: number;
  averageTxAmount: number;
  mostExpensiveTx: number;
  dailyTrend: Array<{ date: string; amount: number }>;
  categoryBreakdown: Array<{ name: string; color: string; amount: number; percentage: number; count: number }>;
  merchantBreakdown: Array<{ name: string; amount: number; percentage: number; count: number }>;
  topCategories: Array<{ name: string; color: string; amount: number; percentage: number }>;
  topMerchants: Array<{ name: string; amount: number; percentage: number }>;
  recentTransactions: Array<{
    id: string;
    merchantName: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    currency: string;
    date: Date | string;
    source: string;
    paymentMethod: string;
  }>;
}

interface DashboardViewProps {
  initialData: DashboardData;
  currency?: string;
  currentPeriod: string;
}

export function DashboardView({ initialData, currency = "USD", currentPeriod }: DashboardViewProps) {
  const router = useRouter();
  const { openScanModal } = useReceiptModal();
  const data = initialData;

  const handlePeriodChange = (p: string) => {
    router.push(`/dashboard?period=${p}`);
  };

  const periodButtons = [
    { label: "This Week", value: "this_week" },
    { label: "Last Week", value: "last_week" },
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "Last 3 Months", value: "last_3_months" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Controls: Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          {periodButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => handlePeriodChange(btn.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 cursor-pointer ${
                currentPeriod === btn.value
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="emerald" size="sm" onClick={openScanModal}>
            <PlusCircle className="h-4 w-4" />
            <span>Scan Receipt</span>
          </Button>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
              <span>All Expenses</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Summary Cards - Built with pure flexbox (flex flex-wrap gap-4) */}
      <div className="flex flex-wrap gap-4 w-full">
        {/* Card 1: Total Spending */}
        <Card className="flex-1 min-w-[240px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Spending ({data.period})
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(data.currentTotal, currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {data.comparison.percentageChange !== null ? (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  data.comparison.isIncrease ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {data.comparison.isIncrease ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {Math.abs(data.comparison.percentageChange)}%
              </span>
            ) : (
              <span className="text-xs text-slate-400">No prior baseline</span>
            )}
            <span className="text-xs text-slate-400">vs previous period</span>
          </div>
        </Card>

        {/* Card 2: Previous Period Total */}
        <Card className="flex-1 min-w-[240px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Previous Comparable Period
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(data.previousTotal, currency)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Absolute difference: {formatCurrency(Math.abs(data.comparison.absoluteDiff), currency)}
          </p>
        </Card>

        {/* Card 3: Total Transactions */}
        <Card className="flex-1 min-w-[240px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transactions
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {data.txCount}
            </span>
            <span className="text-xs text-slate-400">entries</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Scanned & manual records
          </p>
        </Card>

        {/* Card 4: Average Transaction Amount */}
        <Card className="flex-1 min-w-[240px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Transaction
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(data.averageTxAmount, currency)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Per transaction benchmark
          </p>
        </Card>

        {/* Card 5: Highest Single Expense */}
        <Card className="flex-1 min-w-[240px] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Largest Purchase
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(data.mostExpensiveTx, currency)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Peak expense in period
          </p>
        </Card>
      </div>

      {/* Empty State when no transactions exist */}
      {data.txCount === 0 && (
        <Card className="p-12 text-center items-center justify-center border-dashed">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            No Transactions In {data.period}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
            Get started by scanning a receipt with AI OCR or creating a manual entry to view analytics.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="emerald" onClick={openScanModal}>
              <PlusCircle className="h-4 w-4" />
              <span>Scan First Receipt</span>
            </Button>
            <Link href="/transactions">
              <Button variant="outline">Create Manual Entry</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Main Charts & Visualizations - Flexbox Row/Col */}
      {data.txCount > 0 && (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Spending Trend Chart (60% width on desktop) */}
          <Card className="w-full lg:w-7/12 p-6 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daily Spending Trend</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Spending volume across {data.period}
                  </p>
                </div>
                <Badge variant="success">Active Period</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-[260px] w-full">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={data.dailyTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, "Spent"]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#spendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown Donut / List (40% width on desktop) */}
          <Card className="w-full lg:w-5/12 p-6 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Spending by Category</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Distribution across expense categories
              </p>
            </CardHeader>
            <CardContent className="p-0 flex flex-col flex-1 justify-between gap-4">
              {data.categoryBreakdown.length > 0 ? (
                <>
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryBreakdown}
                          dataKey="amount"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {data.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || "#10B981"} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: unknown) => [`$${Number(value).toFixed(2)}`, "Total"]}
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.9)",
                            borderRadius: "12px",
                            border: "none",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                    {data.categoryBreakdown.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cat.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(cat.amount, currency)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({cat.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">No category data</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lower Row: Recent Transactions + Top Merchants */}
      {data.txCount > 0 && (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Recent Transactions (65% width) */}
          <Card className="w-full lg:w-8/12 p-6 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest activity recorded
                  </p>
                </div>
                <Link
                  href="/transactions"
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: `${tx.categoryColor}18`,
                        color: tx.categoryColor,
                      }}
                    >
                      {tx.merchantName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {tx.merchantName}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.categoryName}</span>
                        {tx.source === "RECEIPT" && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Receipt</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {tx.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Merchants by Spend (35% width) */}
          <Card className="w-full lg:w-4/12 p-6 flex flex-col">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Merchants</CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Highest spend destinations
                  </p>
                </div>
                <Link
                  href="/merchants"
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Directory &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-3">
              {data.topMerchants.map((m, idx) => (
                <div key={m.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {m.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(m.amount, currency)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, m.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
