import type { ParsedReceiptSchemaType } from "../schemas/receipt.schema";

export interface OCRInput {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}

export interface OCRResult {
  text: string;
  confidence?: number;
  provider: "ocr-space";
  raw?: unknown;
}

export interface OCRProvider {
  extractText(input: OCRInput): Promise<OCRResult>;
}

export type ParsedReceipt = ParsedReceiptSchemaType;

export interface ReceiptParseInput {
  ocrText: string;
  imageBuffer?: Buffer;
  mimeType?: string;
}

export interface ReceiptAIProvider {
  parseReceipt(input: ReceiptParseInput): Promise<ParsedReceipt>;
}
