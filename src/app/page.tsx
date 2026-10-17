import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  Wallet2,
  Sparkles,
  Receipt,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
            <Wallet2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            SpendWise <span className="text-emerald-600">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="emerald" size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Pure Flexbox */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 max-w-4xl mx-auto flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Receipt Scanning + Google Gemini AI Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.15]">
          Effortless Expense Tracking,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            Powered by Receipt AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mt-5 mb-8 font-normal leading-relaxed">
          Snap paper receipts or drop invoices. SpendWise extracts line items via OCR, structures expenses with Gemini AI, reveals spending habits, and generates verifiable financial insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="emerald" size="lg" className="w-full sm:w-auto shadow-md shadow-emerald-500/25">
              <span>Launch Demo Dashboard</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Create Free Account
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid replaced with Flexbox */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-16 text-left w-full">
          <div className="flex-1 min-w-[260px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              AI Receipt Scanner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Hybrid OCR engine (OCR.Space + Tesseract) extracts raw text, while Gemini structures items, taxes, and amounts.
            </p>
          </div>

          <div className="flex-1 min-w-[260px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Spending Trend Comparisons
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic calculations compare this week vs last week and this month vs last month without hallucinated metrics.
            </p>
          </div>

          <div className="flex-1 min-w-[260px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Verified AI Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actionable recommendations grounded in verified backend analytics with zero-baseline edge case safety.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        SpendWise AI &bull; Production Personal Finance Application with Next.js App Router
      </footer>
    </div>
  );
}
