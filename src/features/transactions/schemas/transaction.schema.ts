import { z } from "zod";

export const transactionItemInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().nullable().optional(),
  unitPrice: z.number().nullable().optional(),
  totalPrice: z.number().nullable().optional(),
  sku: z.string().nullable().optional(),
});

export const createTransactionSchema = z.object({
  merchantName: z.string().min(1, "Merchant name is required"),
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  categoryId: z.string().nullable().optional(),
  paymentMethod: z
    .enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "E_WALLET", "OTHER", "UNKNOWN"])
    .default("UNKNOWN"),
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: z.enum(["MANUAL", "RECEIPT"]).default("MANUAL"),
  items: z.array(transactionItemInputSchema).optional().default([]),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.string().optional(),
  source: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
