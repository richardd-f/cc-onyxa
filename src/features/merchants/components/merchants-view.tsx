"use client";

import * as React from "react";
import { Store, Search, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";

interface MerchantStat {
  id: string;
  displayName: string;
  normalizedName: string;
  transactionCount: number;
  totalSpent: number;
  averageSpent: number;
  lastPurchase: Date | string | null;
  recentTransactions: Array<{
    id: string;
    amount: number;
    date: Date | string;
    category?: { name: string; color?: string | null } | null;
  }>;
}

interface MerchantsViewProps {
  initialMerchants: MerchantStat[];
  currency?: string;
}

export function MerchantsView({ initialMerchants, currency = "USD" }: MerchantsViewProps) {
  const [merchants] = React.useState<MerchantStat[]>(initialMerchants);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"total" | "count" | "name">("total");
  const [selectedMerchant, setSelectedMerchant] = React.useState<MerchantStat | null>(null);

  const filtered = merchants
    .filter((m) => m.displayName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "total") return b.totalSpent - a.totalSpent;
      if (sortBy === "count") return b.transactionCount - a.transactionCount;
      return a.displayName.localeCompare(b.displayName);
    });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Merchant Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spending distribution and purchase frequencies across normalized businesses
          </p>
        </div>
      </div>

      {/* Search and Sort controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search merchants by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="total">Highest Total Spend</option>
              <option value="count">Most Frequent Visits</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Merchants List - Pure Flexbox */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Store className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No merchants found
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Merchants are automatically generated when you scan receipts or add transactions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {/* Table Header */}
            <div className="hidden sm:flex items-center justify-between px-6 py-3 bg-slate-50/70 dark:bg-slate-850/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="w-5/12">Merchant Name</span>
              <span className="w-2/12">Visits</span>
              <span className="w-2/12">Average Spend</span>
              <span className="w-2/12 text-right">Total Spent</span>
              <span className="w-1/12 text-right">Details</span>
            </div>

            {filtered.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMerchant(m)}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors cursor-pointer gap-2 sm:gap-0"
              >
                {/* Col 1: Merchant name & latest date */}
                <div className="flex items-center gap-3.5 sm:w-5/12">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                    {m.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {m.displayName}
                    </span>
                    <span className="text-xs text-slate-400">
                      Last visited {formatDate(m.lastPurchase)}
                    </span>
                  </div>
                </div>

                {/* Col 2: Frequency */}
                <div className="sm:w-2/12 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {m.transactionCount}
                  </span>{" "}
                  <span className="text-slate-400">
                    transaction{m.transactionCount > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Col 3: Average */}
                <div className="sm:w-2/12 text-xs text-slate-600 dark:text-slate-400">
                  {formatCurrency(m.averageSpent, currency)} / visit
                </div>

                {/* Col 4: Total Spent */}
                <div className="sm:w-2/12 text-left sm:text-right font-bold text-sm text-slate-900 dark:text-slate-100">
                  {formatCurrency(m.totalSpent, currency)}
                </div>

                {/* Col 5: Chevron */}
                <div className="sm:w-1/12 flex justify-end text-slate-400">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Merchant Detail Modal */}
      <Modal
        isOpen={!!selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        title={selectedMerchant?.displayName}
        description="Detailed statistics and recent transactions for this merchant."
        maxWidth="lg"
      >
        {selectedMerchant && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Total Spent
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(selectedMerchant.totalSpent, currency)}
                </span>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Purchases
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedMerchant.transactionCount}
                </span>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-col">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Average / Visit
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(selectedMerchant.averageSpent, currency)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Recent Purchases
              </span>
              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 p-2">
                {selectedMerchant.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(tx.date)}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {tx.category?.name || "Uncategorized"}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedMerchant(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
