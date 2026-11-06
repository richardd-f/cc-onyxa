import { OCRProvider, ReceiptAIProvider } from "../types";
import { OCRSpaceProvider } from "./ocr-space.provider";
import { GeminiReceiptAIProvider } from "./gemini.provider";

export function getOCRProvider(): OCRProvider {
  return new OCRSpaceProvider();
}

export function getReceiptAIProvider(): ReceiptAIProvider {
  return new GeminiReceiptAIProvider();
}
