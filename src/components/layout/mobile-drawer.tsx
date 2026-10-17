"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Wallet2, PlusCircle, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./navigation";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanModal?: () => void;
  user?: {
    name?: string | null;
    email: string;
  } | null;
}

export function MobileDrawer({ isOpen, onClose, onOpenScanModal, user }: MobileDrawerProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-200"
      />

      {/* Drawer Panel */}
      <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 shadow-2xl z-10 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-600 text-white">
              <Wallet2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
              SpendWise <span className="text-emerald-600">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4">
          <button
            onClick={() => {
              onClose();
              if (onOpenScanModal) onOpenScanModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-sm shadow-emerald-500/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Scan New Receipt</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || "Alex Morgan"}
            </span>
            <span className="text-[11px] text-slate-400 truncate">
              {user?.email || "demo@spendwise.ai"}
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
