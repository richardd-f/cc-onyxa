import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | { toString: () => string } | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (amount === null || amount === undefined) return "$0.00";
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return "$0.00";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(d);
}

export interface PeriodComparisonResult {
  current: number;
  previous: number;
  absoluteDiff: number;
  percentageChange: number | null;
  isIncrease: boolean;
  hasPreviousData: boolean;
}

export function calculatePeriodComparison(
  current: number,
  previous: number
): PeriodComparisonResult {
  const absoluteDiff = current - previous;
  const isIncrease = absoluteDiff > 0;

  if (previous === 0) {
    return {
      current,
      previous,
      absoluteDiff,
      percentageChange: current > 0 ? 100 : 0,
      isIncrease,
      hasPreviousData: false,
    };
  }

  const percentageChange = Number(((absoluteDiff / previous) * 100).toFixed(1));
  return {
    current,
    previous,
    absoluteDiff,
    percentageChange,
    isIncrease,
    hasPreviousData: true,
  };
}
