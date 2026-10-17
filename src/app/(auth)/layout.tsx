import { Wallet2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <Wallet2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            SpendWise <span className="text-emerald-600">AI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Intelligent Expense & Receipt Tracker
          </span>
        </div>
      </Link>

      <div className="w-full max-w-md flex flex-col">{children}</div>

      <footer className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} SpendWise AI. Secure & Private Financial Tracking.
      </footer>
    </div>
  );
}
