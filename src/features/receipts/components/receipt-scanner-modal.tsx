"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryOption {
  id: string;
  name: string;
  color?: string | null;
}

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReceiptId?: string | null;
  categories?: CategoryOption[];
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  initialReceiptId,
  categories = [],
}: ReceiptScannerModalProps) {
  const router = useRouter();

  const [step, setStep] = React.useState<"upload" | "processing" | "review" | "success">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);
  const [ocrProvider, setOcrProvider] = React.useState<"ocr-space" | "tesseract">("ocr-space");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Review form state
  const [receiptId, setReceiptId] = React.useState<string | null>(initialReceiptId || null);
  const [merchantName, setMerchantName] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [currency, setCurrency] = React.useState("USD");
  const [date, setDate] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("UNKNOWN");
  const [notes, setNotes] = React.useState("");
  const [confidence, setConfidence] = React.useState<number | null>(null);
  const [items, setItems] = React.useState<
    Array<{ name: string; quantity: string; unitPrice: string; totalPrice: string }>
  >([]);

  // Load initial receipt if provided
  React.useEffect(() => {
    if (initialReceiptId && isOpen) {
      loadExistingReceipt(initialReceiptId);
    } else if (!initialReceiptId && isOpen) {
      resetForm();
    }
  }, [initialReceiptId, isOpen]);

  const resetForm = () => {
    setStep("upload");
    setFile(null);
    setFilePreview(null);
    setErrorMsg(null);
    setReceiptId(null);
    setMerchantName("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId("");
    setPaymentMethod("UNKNOWN");
    setNotes("");
    setConfidence(null);
    setItems([]);
  };

  const loadExistingReceipt = async (id: string) => {
    try {
      setStep("processing");
      const res = await fetch(`/api/receipts/${id}`);
      if (!res.ok) throw new Error("Could not load receipt");
      const data = await res.json();
      populateFromReceipt(data.receipt);
    } catch (err) {
      setErrorMsg("Failed to load receipt details");
      setStep("upload");
    }
  };

  const populateFromReceipt = (receipt: any) => {
    setReceiptId(receipt.id);
    setFilePreview(receipt.fileUrl);

    const extracted = receipt.extractedData || {};
    setMerchantName(extracted.merchant || extracted.merchantName || receipt.filename.replace(/\.[^/.]+$/, ""));
    setAmount(extracted.total ? String(extracted.total) : extracted.totalAmount ? String(extracted.totalAmount) : "");
    setCurrency(extracted.currency || "USD");

    const dateVal = extracted.date || extracted.purchaseDate || new Date().toISOString().split("T")[0];
    setDate(dateVal.split("T")[0]);

    setPaymentMethod(extracted.paymentMethod || "UNKNOWN");

    if (extracted.confidence?.overall) {
      setConfidence(Math.round(extracted.confidence.overall * 100));
    } else {
      setConfidence(85);
    }

    // Match suggested category
    if (extracted.suggestedCategory) {
      const match = categories.find(
        (c) => c.name.toLowerCase() === extracted.suggestedCategory.toLowerCase()
      );
      if (match) setCategoryId(match.id);
    }

    if (extracted.items && Array.isArray(extracted.items)) {
      setItems(
        extracted.items.map((i: any) => ({
          name: i.name || "Item",
          quantity: i.quantity ? String(i.quantity) : "1",
          unitPrice: i.unitPrice ? String(i.unitPrice) : "",
          totalPrice: i.totalPrice ? String(i.totalPrice) : "",
        }))
      );
    } else {
      setItems([]);
    }

    setStep("review");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setErrorMsg(null);

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!file) {
      setErrorMsg("Please select a receipt image or PDF");
      return;
    }

    try {
      setStep("processing");
      setErrorMsg(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("ocrProvider", ocrProvider);

      const res = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process receipt");
      }

      populateFromReceipt(data.receipt);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Processing failed");
      setStep("upload");
    }
  };

  const handleConfirm = async () => {
    if (!receiptId) return;

    if (!merchantName.trim()) {
      setErrorMsg("Merchant name is required");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please enter a valid positive total amount");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        receiptId,
        merchantName: merchantName.trim(),
        date,
        amount: parsedAmount,
        currency,
        categoryId: categoryId || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
        items: items
          .filter((i) => i.name.trim() !== "")
          .map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity ? parseFloat(i.quantity) : null,
            unitPrice: i.unitPrice ? parseFloat(i.unitPrice) : null,
            totalPrice: i.totalPrice ? parseFloat(i.totalPrice) : null,
          })),
      };

      const res = await fetch(`/api/receipts/${receiptId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm transaction");
      }

      setStep("success");
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { name: "", quantity: "1", unitPrice: "", totalPrice: "" }]);
  };

  const removeItemRow = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>AI Receipt Scanner & Review</span>
        </div>
      }
      description="Upload your paper or digital receipt. OCR extracts the text, and Google Gemini structures the transaction."
    >
      <div className="flex flex-col gap-5 pt-2">
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === "upload" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors text-center relative">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-3">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : "Click or drag receipt here"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PNG, JPEG, WEBP, and PDF up to 10MB
              </p>
              {file && (
                <span className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
                  {(file.size / 1024).toFixed(0)} KB ready
                </span>
              )}
            </div>

            {/* OCR Provider Selection */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-4 w-4 text-slate-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    OCR Engine
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Choose external OCR.Space API or client/server Tesseract engine
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOcrProvider("ocr-space")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    ocrProvider === "ocr-space"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  OCR.Space (Cloud)
                </button>
                <button
                  type="button"
                  onClick={() => setOcrProvider("tesseract")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    ocrProvider === "tesseract"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  Tesseract (Local)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="emerald"
                disabled={!file}
                onClick={handleUploadAndProcess}
              >
                Scan with AI
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Processing Live State */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="relative flex items-center justify-center h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin" />
              <Sparkles className="h-6 w-6 text-emerald-600 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Processing Receipt...
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Extracting text with {ocrProvider === "ocr-space" ? "OCR.Space" : "Tesseract.js"} and generating structured data via Gemini AI.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Edit Form */}
        {step === "review" && (
          <div className="flex flex-col gap-4">
            {/* Confidence Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Data Extracted Successfully
                </span>
              </div>
              {confidence && (
                <Badge variant="success">
                  {confidence}% AI Confidence
                </Badge>
              )}
            </div>

            {/* Split layout: Receipt Preview + Form */}
            <div className="flex flex-col md:flex-row gap-5">
              {/* Receipt Image / File Preview */}
              {filePreview && (
                <div className="w-full md:w-5/12 flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Receipt Preview
                  </span>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 flex items-center justify-center max-h-72 overflow-hidden">
                    <img
                      src={filePreview}
                      alt="Receipt preview"
                      className="max-h-64 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              <div className={`w-full ${filePreview ? "md:w-7/12" : "w-full"} flex flex-col gap-3.5`}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      label="Merchant Name"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="e.g. Starbucks, Whole Foods"
                    />
                  </div>
                  <div className="w-full sm:w-36">
                    <Input
                      label="Total Amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      label="Transaction Date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Select
                      label="Category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Auto-detected / Others</option>
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
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="UNKNOWN">Unknown / Not Specified</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="CASH">Cash</option>
                      <option value="E_WALLET">E-Wallet (Apple/Google Pay)</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Notes / Description"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional details"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Extracted Line Items Table */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Purchased Items ({items.length})
                </span>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No individual line items parsed. You can add them manually above.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, name: val } : it))
                          );
                        }}
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, quantity: val } : it))
                          );
                        }}
                        className="w-16 text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={item.totalPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, totalPrice: val } : it))
                          );
                        }}
                        className="w-20 text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("upload")}
              >
                Scan Another
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="emerald"
                  size="md"
                  isLoading={isSubmitting}
                  onClick={handleConfirm}
                >
                  Confirm & Save Transaction
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Success confirmation */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Transaction Confirmed!
            </h4>
            <p className="text-xs text-slate-400">
              Receipt status is now COMPLETED and transaction is added to your dashboard.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
