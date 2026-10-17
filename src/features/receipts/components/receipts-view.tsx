"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  PlusCircle,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { useReceiptModal } from "@/features/receipts/context/receipt-modal-context";

interface ReceiptRecord {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  fileUrl?: string | null;
  status: "PENDING" | "PROCESSING" | "NEEDS_REVIEW" | "COMPLETED" | "FAILED";
  ocrProvider?: string | null;
  aiProvider?: string | null;
  ocrText?: string | null;
  extractedData?: any;
  errorMessage?: string | null;
  attemptCount: number;
  uploadedAt: string | Date;
  processedAt?: string | Date | null;
  transaction?: {
    id: string;
    amount: number | any;
    date: string | Date;
    merchant?: { displayName: string } | null;
    category?: { name: string; color?: string | null } | null;
  } | null;
}

interface ReceiptsViewProps {
  initialReceipts: ReceiptRecord[];
  currency?: string;
}

export function ReceiptsView({ initialReceipts, currency = "USD" }: ReceiptsViewProps) {
  const router = useRouter();
  const { openScanModal, openReviewModal } = useReceiptModal();

  const [receipts, setReceipts] = React.useState<ReceiptRecord[]>(initialReceipts);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  // Inspect Modal
  const [selectedReceipt, setSelectedReceipt] = React.useState<ReceiptRecord | null>(null);
  const [isInspectOpen, setIsInspectOpen] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.extractedData?.merchant || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.ocrText || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRetry = async (receiptId: string) => {
    try {
      setIsRetrying(true);
      const res = await fetch(`/api/receipts/${receiptId}/retry`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");

      // Update local state
      setReceipts((prev) => prev.map((r) => (r.id === receiptId ? data.receipt : r)));
      if (selectedReceipt?.id === receiptId) {
        setSelectedReceipt(data.receipt);
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;

    try {
      const res = await fetch(`/api/receipts/${receiptId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
      if (selectedReceipt?.id === receiptId) setIsInspectOpen(false);
      router.refresh();
    } catch (err) {
      alert("Failed to delete receipt");
    }
  };

  const getStatusBadge = (status: ReceiptRecord["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </Badge>
        );
      case "NEEDS_REVIEW":
        return (
          <Badge variant="warning">
            <Clock className="h-3 w-3" />
            <span>Needs Review</span>
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge variant="info">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="danger">
            <AlertCircle className="h-3 w-3" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Receipt Archive
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Uploaded digital & paper receipts, OCR extraction logs, and AI parsing records
          </p>
        </div>

        <Button variant="emerald" size="sm" onClick={openScanModal}>
          <PlusCircle className="h-4 w-4" />
          <span>Upload New Receipt</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search receipts by filename, merchant, OCR text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Receipts Table / List - Pure Flexbox */}
      <Card className="overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Receipt className="h-10 w-10 text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No receipts found
            </p>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              Upload a paper receipt photo or PDF to start scanning automatically.
            </p>
            <Button variant="emerald" size="sm" onClick={openScanModal}>
              <PlusCircle className="h-4 w-4" />
              <span>Scan Receipt</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {/* Header */}
            <div className="hidden sm:flex items-center justify-between px-6 py-3 bg-slate-50/70 dark:bg-slate-850/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <span className="w-5/12">Receipt & Date</span>
              <span className="w-2/12">Status</span>
              <span className="w-3/12">Extracted Info</span>
              <span className="w-2/12 text-right">Actions</span>
            </div>

            {filteredReceipts.map((rcpt) => (
              <div
                key={rcpt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors gap-3 sm:gap-0"
              >
                {/* Col 1: Filename & Upload Date */}
                <div className="flex items-center gap-3.5 sm:w-5/12">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {rcpt.filename}
                    </span>
                    <span className="text-xs text-slate-400">
                      Uploaded {formatDate(rcpt.uploadedAt)} • {(rcpt.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>

                {/* Col 2: Status */}
                <div className="sm:w-2/12">{getStatusBadge(rcpt.status)}</div>

                {/* Col 3: Extracted Merchant & Amount */}
                <div className="sm:w-3/12 flex flex-col text-xs">
                  {rcpt.extractedData?.merchant || rcpt.extractedData?.total ? (
                    <>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {rcpt.extractedData.merchant || "Extracted Merchant"}
                      </span>
                      <span className="text-slate-400">
                        Total: {rcpt.extractedData.total ? formatCurrency(rcpt.extractedData.total, currency) : "Pending"}
                      </span>
                    </>
                  ) : rcpt.errorMessage ? (
                    <span className="text-rose-500 truncate" title={rcpt.errorMessage}>
                      {rcpt.errorMessage}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Processing details...</span>
                  )}
                </div>

                {/* Col 4: Action Buttons */}
                <div className="sm:w-2/12 flex items-center justify-end gap-1.5">
                  {/* If needs review, offer direct review button */}
                  {rcpt.status === "NEEDS_REVIEW" && (
                    <Button
                      variant="emerald"
                      size="sm"
                      onClick={() => openReviewModal(rcpt.id)}
                    >
                      Review & Confirm
                    </Button>
                  )}

                  {/* If failed, allow retry */}
                  {rcpt.status === "FAILED" && (
                    <button
                      onClick={() => handleRetry(rcpt.id)}
                      title="Retry processing"
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}

                  {/* View Details modal */}
                  <button
                    onClick={() => {
                      setSelectedReceipt(rcpt);
                      setIsInspectOpen(true);
                    }}
                    title="Inspect OCR & Data"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(rcpt.id)}
                    title="Delete receipt"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* INSPECT RECEIPT MODAL */}
      <Modal
        isOpen={isInspectOpen}
        onClose={() => setIsInspectOpen(false)}
        title="Receipt Details & OCR Analysis"
        description="Inspect the stored file, extracted text, and AI JSON structuring."
        maxWidth="3xl"
      >
        {selectedReceipt && (
          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Image thumbnail */}
              {selectedReceipt.fileUrl && (
                <div className="w-full sm:w-5/12 flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase text-slate-400">
                    Receipt Image
                  </span>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 flex justify-center max-h-64 overflow-hidden">
                    <img
                      src={selectedReceipt.fileUrl}
                      alt="Receipt"
                      className="max-h-60 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex-1 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400">Status</span>
                  <div>{getStatusBadge(selectedReceipt.status)}</div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400">OCR Provider</span>
                  <span className="font-semibold">{selectedReceipt.ocrProvider || "ocr-space"}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400">AI Provider</span>
                  <span className="font-semibold">{selectedReceipt.aiProvider || "gemini"}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-slate-400">Uploaded</span>
                  <span>{formatDateTime(selectedReceipt.uploadedAt)}</span>
                </div>
              </div>
            </div>

            {/* Extracted Raw OCR text */}
            {selectedReceipt.ocrText && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Raw OCR Text
                </span>
                <pre className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 font-mono text-[11px] text-slate-700 dark:text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {selectedReceipt.ocrText}
                </pre>
              </div>
            )}

            {/* Extracted Structured JSON */}
            {selectedReceipt.extractedData && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-slate-400">
                  Gemini Structured JSON
                </span>
                <pre className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 max-h-40 overflow-y-auto">
                  {JSON.stringify(selectedReceipt.extractedData, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              {selectedReceipt.status === "FAILED" && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isRetrying}
                  onClick={() => handleRetry(selectedReceipt.id)}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span>Retry Processing</span>
                </Button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setIsInspectOpen(false)}>
                  Close
                </Button>
                {selectedReceipt.status === "NEEDS_REVIEW" && (
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => {
                      setIsInspectOpen(false);
                      openReviewModal(selectedReceipt.id);
                    }}
                  >
                    Open Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
