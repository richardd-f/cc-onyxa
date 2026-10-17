import { ReceiptStatus, TransactionSource, PaymentMethod } from "@prisma/client";

export type { ReceiptStatus, TransactionSource, PaymentMethod };

export interface OCRInput {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface OCRResult {
  text: string;
  confidence?: number;
  provider: "ocr-space" | "tesseract" | "mock";
  raw?: any;
}

export interface OCRProvider {
  extractText(input: OCRInput): Promise<OCRResult>;
}

export interface ParsedReceiptItem {
  name: string;
  quantity?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
}

export interface ParsedReceipt {
  merchantName: string | null;
  purchaseDate: string | null;
  totalAmount: number | null;
  currency: string | null;
  taxAmount: number | null;
  subtotal: number | null;
  paymentMethod: PaymentMethod;
  receiptNumber: string | null;
  suggestedCategory: string | null;
  items: ParsedReceiptItem[];
  confidence: {
    merchant: number;
    amount: number;
    date: number;
    overall: number;
  };
}

export interface ReceiptParseInput {
  ocrText: string;
  imageBuffer?: Buffer;
  mimeType?: string;
}

export interface ReceiptAIProvider {
  parseReceipt(input: ReceiptParseInput): Promise<ParsedReceipt>;
}
