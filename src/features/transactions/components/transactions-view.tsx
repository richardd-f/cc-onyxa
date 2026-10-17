"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  Receipt,
  FileText,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useReceiptModal } from "@/features/receipts/context/receipt-modal-context";

interface TransactionItem {
  id?: string;
  name: string;
  quantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
}

interface Transaction {
  id: string;
  merchantId?: string | null;
  categoryId?: string | null;
  receiptId?: string | null;
  date: string | Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string | null;
  notes?: string | null;
  source: string;
  merchant?: { displayName: string } | null;
  category?: { id: string; name: string; color?: string | null } | null;
  receipt?: { id: string; filename: string; fileUrl?: string | null } | null;
  items: TransactionItem[];
}

interface TransactionsViewProps {
  initialTransactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  categories: Array<{ id: string; name: string; color?: string | null }>;
  currency?: string;
}

export function TransactionsView({
  initialTransactions,
  pagination,
  categories,
  currency = "USD",
}: TransactionsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openScanModal } = useReceiptModal();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get("categoryId") || "ALL");
  const [selectedMethod, setSelectedMethod] = React.useState(searchParams.get("paymentMethod") || "ALL");
  const [selectedSource, setSelectedSource] = React.useState(searchParams.get("source") || "ALL");
  const [sortBy, setSortBy] = React.useState<"date" | "amount">((searchParams.get("sortBy") as any) || "date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">((searchParams.get("sortOrder") as any) || "desc");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [activeTx, setActiveTx] = React.useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // Form Fields
  const [formMerchant, setFormMerchant] = React.useState("");
  const [formAmount, setFormAmount] = React.useState("");
  const [formDate, setFormDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = React.useState("");
  const [formMethod, setFormMethod] = React.useState("UNKNOWN");
  const [formNotes, setFormNotes] = React.useState("");
  const [formItems, setFormItems] = React.useState<Array<{ name: string; quantity: string; unitPrice: string; totalPrice: string }>>([]);

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    const query = {
      search: searchTerm,
      categoryId: selectedCategory,
      paymentMethod: selectedMethod,
      source: selectedSource,
      sortBy,
      sortOrder,
      page: "1",
      ...overrides,
    };

    Object.entries(query).forEach(([k, v]) => {
      if (!v || v === "ALL") params.delete(k);
      else params.set(k, v);
    });

    router.push(`/transactions?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  };

  const openCreateModal = () => {
    setActiveTx(null);
    setFormMerchant("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormCategory("");
    setFormMethod("UNKNOWN");
    setFormNotes("");
    setFormItems([]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setActiveTx(tx);
    setFormMerchant(tx.merchant?.displayName || "");
    setFormAmount(String(tx.amount));
    setFormDate(new Date(tx.date).toISOString().split("T")[0]);
    setFormCategory(tx.categoryId || "");
    setFormMethod(tx.paymentMethod);
    setFormNotes(tx.notes || "");
    setFormItems(
      (tx.items || []).map((i) => ({
        name: i.name,
        quantity: i.quantity ? String(i.quantity) : "1",
        unitPrice: i.unitPrice ? String(i.unitPrice) : "",
        totalPrice: i.totalPrice ? String(i.totalPrice) : "",
      }))
    );
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMerchant.trim()) {
      setFormError("Merchant name is required");
      return;
    }

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Amount must be a positive number");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        merchantName: formMerchant.trim(),
        amount: amt,
        currency,
        date: formDate,
        categoryId: formCategory || null,
        paymentMethod: formMethod,
        notes: formNotes.trim() || null,
        source: activeTx ? activeTx.source : "MANUAL",
        items: formItems
          .filter((i) => i.name.trim() !== "")
          .map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity ? parseFloat(i.quantity) : null,
            unitPrice: i.unitPrice ? parseFloat(i.unitPrice) : null,
            totalPrice: i.totalPrice ? parseFloat(i.totalPrice) : null,
          })),
      };

      const url = activeTx ? `/api/transactions/${activeTx.id}` : "/api/transactions";
      const method = activeTx ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setIsFormModalOpen(false);
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!activeTx) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/transactions/${activeTx.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      setIsDeleteModalOpen(false);
      setActiveTx(null);
      router.refresh();
    } catch (err) {
      alert("Failed to delete transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Expenses & Transactions
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, filter, and review all verified financial activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            <span>Manual Expense</span>
          </Button>
          <Button variant="emerald" size="sm" onClick={openScanModal}>
            <Receipt className="h-4 w-4" />
            <span>Scan Receipt</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar - Pure Flexbox */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search box */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by merchant, description, items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                applyFilters({ categoryId: e.target.value });
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedMethod}
              onChange={(e) => {
                setSelectedMethod(e.target.value);
                applyFilters({ paymentMethod: e.target.value });
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="ALL">All Payments</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="E_WALLET">E-Wallet</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                applyFilters({ source: e.target.value });
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="ALL">All Sources</option>
              <option value="RECEIPT">Receipt Scan</option>
              <option value="MANUAL">Manual Entry</option>
            </select>

            {/* Sorting toggle */}
            <button
              onClick={() => {
                const nextOrder = sortOrder === "desc" ? "asc" : "desc";
                setSortOrder(nextOrder);
                applyFilters({ sortOrder: nextOrder });
              }}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>{sortBy === "date" ? "Date" : "Amount"}: {sortOrder.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Transactions Table - Styled Pure Flexbox List */}
      <Card className="overflow-hidden">
        {initialTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Receipt className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No transactions found
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Try adjusting your search filters, scan a receipt, or add a transaction.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {/* Table Header Row */}
            <div className="hidden sm:flex items-center justify-between px-6 py-3 bg-slate-50/70 dark:bg-slate-850/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="w-5/12">Merchant & Date</span>
              <span className="w-3/12">Category</span>
              <span className="w-2/12 text-right">Amount</span>
              <span className="w-2/12 text-right">Actions</span>
            </div>

            {/* Transaction Rows */}
            {initialTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors gap-3 sm:gap-0"
              >
                {/* Col 1: Merchant & Date */}
                <div className="flex items-center gap-3.5 sm:w-5/12">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                    style={{
                      backgroundColor: `${tx.category?.color || "#94A3B8"}18`,
                      color: tx.category?.color || "#94A3B8",
                    }}
                  >
                    {tx.merchant?.displayName.slice(0, 2).toUpperCase() || "TX"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {tx.merchant?.displayName || "Direct Merchant"}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="text-[11px] uppercase">{tx.paymentMethod.replace("_", " ")}</span>
                      {tx.source === "RECEIPT" && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                            Receipt
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Col 2: Category */}
                <div className="sm:w-3/12 flex items-center">
                  <Badge variant="default" className="text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tx.category?.color || "#94A3B8" }}
                    />
                    <span>{tx.category?.name || "Uncategorized"}</span>
                  </Badge>
                </div>

                {/* Col 3: Amount */}
                <div className="sm:w-2/12 text-left sm:text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(tx.amount, tx.currency)}
                  </span>
                  {tx.items && tx.items.length > 0 && (
                    <span className="block text-[11px] text-slate-400">
                      {tx.items.length} item{tx.items.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Col 4: Action Buttons */}
                <div className="sm:w-2/12 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setActiveTx(tx);
                      setIsDetailModalOpen(true);
                    }}
                    title="View details"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(tx)}
                    title="Edit transaction"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTx(tx);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete transaction"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Showing {pagination.page} of {pagination.totalPages} pages ({pagination.total} records)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL 1: Create / Edit Transaction Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={activeTx ? "Edit Expense" : "New Expense Entry"}
        description="Save your expense manually with merchant, category, and line item details."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveTransaction} className="flex flex-col gap-4 pt-1">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                label="Merchant / Business Name"
                value={formMerchant}
                onChange={(e) => setFormMerchant(e.target.value)}
                placeholder="e.g. Starbucks, Shell, Amazon"
                required
              />
            </div>
            <div className="w-full sm:w-36">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                label="Date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <Select
                label="Category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Select
                label="Payment Method"
                value={formMethod}
                onChange={(e) => setFormMethod(e.target.value)}
              >
                <option value="UNKNOWN">Unknown</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CASH">Cash</option>
                <option value="E_WALLET">E-Wallet</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                label="Notes / Description"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Optional memo"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="emerald" size="md" isLoading={isSubmitting}>
              {activeTx ? "Save Changes" : "Create Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Transaction Details"
        description="Inspect full receipt items and metadata."
        maxWidth="lg"
      >
        {activeTx && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeTx.merchant?.displayName || "Direct Transaction"}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(activeTx.date)} • {activeTx.category?.name || "Uncategorized"}
                </span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(activeTx.amount, activeTx.currency)}
              </span>
            </div>

            {/* Line items if any */}
            {activeTx.items && activeTx.items.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Line Items ({activeTx.items.length})
                </span>
                <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-800 p-2">
                  {activeTx.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                        {item.quantity && (
                          <span className="text-slate-400">×{String(item.quantity)}</span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.totalPrice ? formatCurrency(item.totalPrice, activeTx.currency) : "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Receipt preview if available */}
            {activeTx.receipt?.fileUrl && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Linked Receipt Image
                </span>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 flex justify-center max-h-56 overflow-hidden">
                  <img
                    src={activeTx.receipt.fileUrl}
                    alt="Receipt"
                    className="max-h-52 object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: Confirm Delete Modal (with Blurred Backdrop) */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction?"
        description="Are you sure you want to permanently delete this transaction? This action cannot be undone."
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4 pt-2">
          {activeTx && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-col gap-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeTx.merchant?.displayName}
              </span>
              <span className="text-slate-500">
                {formatDate(activeTx.date)} • {formatCurrency(activeTx.amount, activeTx.currency)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleDeleteTransaction}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
