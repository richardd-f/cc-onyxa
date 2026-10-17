"use client";

import { Menu, PlusCircle, Calendar, Sparkles } from "lucide-react";

interface TopHeaderProps {
  onToggleMobileNav?: () => void;
  onOpenScanModal?: () => void;
  title?: string;
  subtitle?: string;
}

export function TopHeader({
  onToggleMobileNav,
  onOpenScanModal,
  title = "Overview",
  subtitle = "SpendWise AI Finance Tracker",
}: TopHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md">
      {/* Title & Date Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          aria-label="Toggle navigation"
          className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-medium">
              <Sparkles className="h-3 w-3" />
              AI Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{todayFormatted}</span>
        </div>

        <button
          onClick={onOpenScanModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs sm:text-sm shadow-sm shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Scan Receipt</span>
          <span className="sm:hidden">Scan</span>
        </button>
      </div>
    </header>
  );
}
