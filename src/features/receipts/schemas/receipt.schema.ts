import { z } from "zod";

export const parsedReceiptItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().nullable().optional(),
  unitPrice: z.number().nullable().optional(),
  totalPrice: z.number().nullable().optional(),
});

export const parsedReceiptSchema = z.object({
  merchantName: z.string().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  totalAmount: z.number().nullable().optional(),
  currency: z.string().default("USD").nullable().optional(),
  taxAmount: z.number().nullable().optional(),
  subtotal: z.number().nullable().optional(),
  paymentMethod: z
    .enum(["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "E_WALLET", "OTHER", "UNKNOWN"])
    .default("UNKNOWN"),
  receiptNumber: z.string().nullable().optional(),
  suggestedCategory: z.string().nullable().optional(),
  items: z.array(parsedReceiptItemSchema).default([]),
  confidence: z
    .object({
      merchant: z.number().default(0.8),
      amount: z.number().default(0.8),
      date: z.number().default(0.8),
      overall: z.number().default(0.8),
    })
    .default({ merchant: 0.8, amount: 0.8, date: 0.8, overall: 0.8 }),
});

export type ParsedReceiptSchemaType = z.infer<typeof parsedReceiptSchema>;
