import { OCRProvider, ReceiptAIProvider } from "../types";
import { OCRSpaceProvider } from "./ocr-space.provider";
import { TesseractProvider } from "./tesseract.provider";
import { GeminiReceiptAIProvider } from "./gemini.provider";

export function getOCRProvider(override?: "ocr-space" | "tesseract"): OCRProvider {
  const providerType = override || process.env.OCR_PROVIDER || "ocr-space";
  if (providerType === "tesseract") {
    return new TesseractProvider();
  }
  return new OCRSpaceProvider();
}

export function getReceiptAIProvider(): ReceiptAIProvider {
  return new GeminiReceiptAIProvider();
}
