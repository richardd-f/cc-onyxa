import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().optional().default(process.env.NEXTAUTH_SECRET || "spendwise-secret-key-development-mode-12345"),
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().optional().default("gemini-2.5-flash"),
  OCR_PROVIDER: z.enum(["ocr-space", "tesseract"]).optional().default("ocr-space"),
  OCR_SPACE_API_KEY: z.string().optional().default(""),
  AI_PROVIDER: z.enum(["gemini"]).optional().default("gemini"),
  STORAGE_PROVIDER: z.string().optional().default("local"),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
});

function getEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn("Environment variable validation warnings:", result.error.format());
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "spendwise-secret-key-development-mode-12345",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      OCR_PROVIDER: (process.env.OCR_PROVIDER as "ocr-space" | "tesseract") || "ocr-space",
      OCR_SPACE_API_KEY: process.env.OCR_SPACE_API_KEY || "",
      AI_PROVIDER: "gemini" as const,
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "local",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    };
  }
  return result.data;
}

export const env = getEnv();
