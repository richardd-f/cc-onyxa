"use client";

import { Menu, Calendar } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navigation";

interface TopHeaderProps {
  onToggleMobileNav?: () => void;
  title?: string;
  subtitle?: string;
}

const PAGE_SUBTITLES: Record<string, string> = {
  "/dashboard": "Onyxa MSME business workspace",
  "/settings": "Customize currency display, regional defaults, data backups, and security",
};

export function TopHeader({
  onToggleMobileNav,
  title,
  subtitle,
}: TopHeaderProps) {
  const pathname = usePathname();

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  // Derive title from pathname if not explicitly passed
  const activeNavItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)
  );
  const resolvedTitle = title ?? activeNavItem?.label ?? "Overview";
  const resolvedSubtitle = subtitle ?? PAGE_SUBTITLES[pathname ?? ""] ?? "Onyxa business workspace";

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
              {resolvedTitle}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            {resolvedSubtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{todayFormatted}</span>
        </div>

      </div>
    </header>
  );
}
