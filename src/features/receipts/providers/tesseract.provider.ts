import { createWorker } from "tesseract.js";
import { OCRInput, OCRProvider, OCRResult } from "../types";

export class TesseractProvider implements OCRProvider {
  async extractText(input: OCRInput): Promise<OCRResult> {
    const worker = await createWorker("eng");
    try {
      const ret = await worker.recognize(input.buffer);
      await worker.terminate();

      return {
        text: ret.data.text || "",
        confidence: ret.data.confidence,
        provider: "tesseract",
        raw: { confidence: ret.data.confidence },
      };
    } catch (error) {
      await worker.terminate().catch(() => {});
      throw new Error(`Tesseract OCR failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
