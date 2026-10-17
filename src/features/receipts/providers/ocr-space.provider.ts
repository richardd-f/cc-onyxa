import { OCRInput, OCRProvider, OCRResult } from "../types";

export class OCRSpaceProvider implements OCRProvider {
  private apiKey: string;
  private endpoint = "https://api.ocr.space/parse/image";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OCR_SPACE_API_KEY || "K87899142388957"; // standard public test key or user key
  }

  async extractText(input: OCRInput): Promise<OCRResult> {
    const base64Image = `data:${input.mimeType};base64,${input.buffer.toString("base64")}`;
    const formData = new FormData();
    formData.append("base64Image", base64Image);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("filetype", input.mimeType.includes("pdf") ? "PDF" : "JPG");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2");

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        apikey: this.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.Space API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.IsErroredOnProcessing) {
      const msg = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join(", ") : data.ErrorMessage || "OCR Processing failed";
      throw new Error(`OCR.Space failure: ${msg}`);
    }

    const parsedResults = data.ParsedResults || [];
    const extractedText = parsedResults.map((r: any) => r.ParsedText || "").join("\n").trim();

    return {
      text: extractedText,
      provider: "ocr-space",
      raw: data,
    };
  }
}
