import {
  LayoutDashboard,
  ReceiptText,
  Receipt,
  TrendingUp,
  Sparkles,
  Store,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ReceiptText },
  { label: "Receipts", href: "/receipts", icon: Receipt },
  { label: "Analytics", href: "/analytics", icon: TrendingUp },
  { label: "AI Insights", href: "/insights", icon: Sparkles, badge: "Gemini" },
  { label: "Merchants", href: "/merchants", icon: Store },
  { label: "Settings", href: "/settings", icon: Settings },
];
