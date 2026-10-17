"use client";

import * as React from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Repeat,
  PieChart,
  Store,
  Zap,
  Lightbulb,
  X,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FinancialInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  evidence: Record<string, unknown> | null;
  createdAt: string | Date;
}

interface InsightsViewProps {
  initialInsights: FinancialInsight[];
}

export function InsightsView({ initialInsights }: InsightsViewProps) {
  const router = useRouter();
  const [insights, setInsights] = React.useState<FinancialInsight[]>(initialInsights);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setMsg(null);
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate insights");

      setInsights(data.insights);
      setMsg("AI financial insights updated successfully!");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to refresh insights");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss", insightId: id }),
      });
      if (res.ok) {
        setInsights((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {}
  };

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case "SPENDING_INCREASE":
        return <TrendingUp className="h-5 w-5 text-rose-500" />;
      case "SPENDING_DECREASE":
        return <TrendingDown className="h-5 w-5 text-emerald-500" />;
      case "RECURRING_HABIT":
        return <Repeat className="h-5 w-5 text-purple-500" />;
      case "CATEGORY_CONCENTRATION":
        return <PieChart className="h-5 w-5 text-blue-500" />;
      case "MERCHANT_CONCENTRATION":
        return <Store className="h-5 w-5 text-indigo-500" />;
      case "SAVING_OPPORTUNITY":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      default:
        return <Zap className="h-5 w-5 text-emerald-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              AI Financial Insights
            </h2>
            <Badge variant="success">Google Gemini 2.5</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized intelligence and actionable recommendations derived from verified metrics
          </p>
        </div>

        <Button
          variant="emerald"
          size="sm"
          isLoading={isRefreshing}
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          <span>Regenerate Insights</span>
        </Button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Insights are computed strictly from your verified database transactions. The AI explains trends and suggests optimizations without inventing financial statistics.
          </span>
        </div>
      </div>

      {/* Insights Cards List - Pure Flexbox */}
      {insights.length === 0 ? (
        <Card className="p-12 text-center items-center justify-center">
          <Sparkles className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Insights Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
            Upload receipts or add transactions so SpendWise AI can detect spending patterns.
          </p>
          <Button variant="emerald" size="sm" onClick={handleRefresh}>
            Generate Now
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {insights.map((insight) => (
            <Card
              key={insight.id}
              className="p-6 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                {/* Left: Icon and Details */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-11 w-11 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0">
                    {getInsightTypeIcon(insight.type)}
                  </div>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {insight.title}
                      </h4>
                      <Badge variant="neutral" className="text-[10px]">
                        {insight.type.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {insight.description}
                    </p>

                    {/* Supporting numerical evidence badge */}
                    {insight.evidence && Object.keys(insight.evidence).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        {Object.entries(insight.evidence).map(([k, v]) => {
                          if (typeof v === "object" || v === null) return null;
                          return (
                            <span
                              key={k}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium"
                            >
                              <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>:{" "}
                              <strong className="text-slate-900 dark:text-slate-200">
                                {typeof v === "number" && String(v).includes(".") ? v.toFixed(2) : String(v)}
                              </strong>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Dismiss & Date */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    title="Dismiss insight"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-[11px] text-slate-400">
                    {formatDate(insight.createdAt)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
