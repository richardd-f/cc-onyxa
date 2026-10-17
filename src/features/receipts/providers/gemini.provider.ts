import { GoogleGenAI } from "@google/genai";
import { ReceiptAIProvider, ReceiptParseInput, ParsedReceipt } from "../types";
import { parsedReceiptSchema } from "../schemas/receipt.schema";

export class GeminiReceiptAIProvider implements ReceiptAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.model = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  async parseReceipt(input: ReceiptParseInput): Promise<ParsedReceipt> {
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY is not configured. Falling back to deterministic receipt heuristic extraction.");
      return this.heuristicParse(input.ocrText);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const prompt = `You are a financial receipt parser. Extract structured information from the following OCR text of a receipt:

---
${input.ocrText}
---

Return a strictly valid JSON object matching this schema:
{
  "merchantName": string or null,
  "purchaseDate": "YYYY-MM-DD" or null,
  "totalAmount": number or null,
  "currency": "USD" or standard 3-letter code,
  "taxAmount": number or null,
  "subtotal": number or null,
  "paymentMethod": "CASH" | "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "E_WALLET" | "OTHER" | "UNKNOWN",
  "receiptNumber": string or null,
  "suggestedCategory": "Food & Beverage" | "Groceries" | "Transportation" | "Shopping" | "Healthcare" | "Education" | "Entertainment" | "Utilities" | "Others" or null,
  "items": [
    {
      "name": string,
      "quantity": number or null,
      "unitPrice": number or null,
      "totalPrice": number or null
    }
  ],
  "confidence": {
    "merchant": number (0.0 to 1.0),
    "amount": number (0.0 to 1.0),
    "date": number (0.0 to 1.0),
    "overall": number (0.0 to 1.0)
  }
}
Do not invent missing numbers. If a field cannot be determined, use null.`;

      const response = await ai.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "{}";
      const parsedJson = JSON.parse(responseText);
      const validation = parsedReceiptSchema.safeParse(parsedJson);

      if (validation.success) {
        return validation.data as ParsedReceipt;
      }

      console.warn("Gemini receipt response validation warning:", validation.error);
      return this.heuristicParse(input.ocrText);
    } catch (error) {
      console.error("Gemini receipt parsing failed:", error);
      return this.heuristicParse(input.ocrText);
    }
  }

  private heuristicParse(text: string): ParsedReceipt {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const firstLine = lines[0] || "Unknown Merchant";

    // Regex for amounts e.g. Total $12.34 or 12.34
    let totalAmount: number | null = null;
    let taxAmount: number | null = null;
    const totalMatch = text.match(/(?:TOTAL|Total|AMOUNT|Amount|BALANCE|Balance)[\s:$]*([0-9]+\.[0-9]{2})/i);
    if (totalMatch) {
      totalAmount = parseFloat(totalMatch[1]);
    } else {
      const anyPrice = text.match(/\$?([0-9]+\.[0-9]{2})/);
      if (anyPrice) totalAmount = parseFloat(anyPrice[1]);
    }

    const taxMatch = text.match(/(?:TAX|Tax|VAT)[\s:$]*([0-9]+\.[0-9]{2})/i);
    if (taxMatch) {
      taxAmount = parseFloat(taxMatch[1]);
    }

    // Date regex e.g. 2026-10-15 or 10/15/2026
    let purchaseDate: string | null = null;
    const dateMatch = text.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/);
    if (dateMatch) {
      const parsedD = new Date(dateMatch[1]);
      if (!isNaN(parsedD.getTime())) {
        purchaseDate = parsedD.toISOString().split("T")[0];
      }
    }

    let paymentMethod: ParsedReceipt["paymentMethod"] = "UNKNOWN";
    if (/visa|mastercard|amex|credit/i.test(text)) paymentMethod = "CREDIT_CARD";
    else if (/debit/i.test(text)) paymentMethod = "DEBIT_CARD";
    else if (/cash/i.test(text)) paymentMethod = "CASH";
    else if (/apple pay|google pay|wallet/i.test(text)) paymentMethod = "E_WALLET";

    return {
      merchantName: firstLine.length > 50 ? firstLine.slice(0, 50) : firstLine,
      purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
      totalAmount: totalAmount || null,
      currency: "USD",
      taxAmount,
      subtotal: null,
      paymentMethod,
      receiptNumber: null,
      suggestedCategory: "Others",
      items: [],
      confidence: {
        merchant: 0.6,
        amount: totalAmount ? 0.7 : 0.3,
        date: purchaseDate ? 0.7 : 0.3,
        overall: 0.6,
      },
    };
  }
}
