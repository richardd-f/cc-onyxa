"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Wallet2, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: {
    name?: string | null;
    email: string;
    image?: string | null;
  } | null;
  onOpenScanModal?: () => void;
}

export function Sidebar({ user, onOpenScanModal }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-20">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 px-6 h-18 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
          <Wallet2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            SpendWise <span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Finance & Receipt Intelligence
          </span>
        </div>
      </div>

      {/* Prominent Action Button */}
      <div className="p-4 pb-2">
        <button
          onClick={onOpenScanModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm shadow-emerald-600/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Scan New Receipt</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 gap-1 px-3 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-emerald-400 dark:text-emerald-600"
                      : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full tracking-wide",
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 dark:bg-emerald-600/20 dark:text-emerald-700"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card & Sign Out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || "SW"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || "Personal Finance"}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {user?.email || "demo@spendwise.ai"}
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
