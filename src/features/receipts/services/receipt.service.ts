import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { getOCRProvider, getReceiptAIProvider } from "../providers";
import { ParsedReceipt } from "../types";
import { findOrCreateMerchant } from "@/features/merchants/services/merchant.service";
import { resolveCategoryForMerchant } from "@/features/categories/services/category.service";
import { ConfirmReceiptSchemaType } from "../schemas/receipt.schema";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "receipts");

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

export async function processReceiptUpload(
  userId: string,
  file: File,
  ocrProviderOverride?: "ocr-space" | "tesseract"
) {
  await ensureUploadDir();

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
  const extension = path.extname(file.name) || ".jpg";
  const safeFilename = `${userId}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${extension}`;
  const filePath = path.join(UPLOAD_DIR, safeFilename);

  // Write file securely
  await fs.writeFile(filePath, buffer);
  const fileUrl = `/uploads/receipts/${safeFilename}`;

  // Create initial receipt record
  const receipt = await prisma.receipt.create({
    data: {
      userId,
      filename: file.name,
      mimeType: file.type || "image/jpeg",
      fileSize: file.size,
      storageKey: filePath,
      fileUrl,
      checksum,
      status: "PROCESSING",
      ocrProvider: ocrProviderOverride || process.env.OCR_PROVIDER || "ocr-space",
      aiProvider: "gemini",
      attemptCount: 1,
    },
  });

  try {
    // 1. OCR Extraction
    const ocrProvider = getOCRProvider(ocrProviderOverride);
    const ocrResult = await ocrProvider.extractText({
      buffer,
      mimeType: file.type || "image/jpeg",
      filename: file.name,
    });

    // 2. Structured AI Parsing
    const aiProvider = getReceiptAIProvider();
    const parsedData: ParsedReceipt = await aiProvider.parseReceipt({
      ocrText: ocrResult.text,
      imageBuffer: buffer,
      mimeType: file.type || "image/jpeg",
    });

    // 3. Update receipt to NEEDS_REVIEW
    const updatedReceipt = await prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        ocrText: ocrResult.text,
        extractedData: parsedData as any,
        status: "NEEDS_REVIEW",
        errorCode: null,
        errorMessage: null,
      },
    });

    return updatedReceipt;
  } catch (error) {
    console.error("Receipt processing error:", error);
    const updatedReceipt = await prisma.receipt.update({
      where: { id: receipt.id },
      data: {
        status: "FAILED",
        errorCode: "PROCESSING_FAILED",
        errorMessage: error instanceof Error ? error.message : "Failed to extract receipt data",
      },
    });
    return updatedReceipt;
  }
}

export async function confirmReceiptTransaction(
  userId: string,
  input: ConfirmReceiptSchemaType
) {
  const receipt = await prisma.receipt.findFirst({
    where: { id: input.receiptId, userId },
    include: { transaction: true },
  });

  if (!receipt) {
    throw new Error("Receipt not found or unauthorized");
  }

  // Prevent duplicate transactions
  if (receipt.transaction) {
    throw new Error("A transaction has already been created for this receipt");
  }

  // Find or create normalized merchant
  const merchant = await findOrCreateMerchant(userId, input.merchantName);

  // Resolve category
  let categoryId = input.categoryId;
  if (!categoryId) {
    categoryId = await resolveCategoryForMerchant(userId, input.merchantName);
  }

  // Check if category was set and save a rule for future learning
  if (categoryId) {
    try {
      await prisma.userCategoryRule.upsert({
        where: {
          id: `${userId}_${merchant.normalizedName}`,
        },
        create: {
          id: `${userId}_${merchant.normalizedName}`,
          userId,
          ruleType: "MERCHANT_EXACT",
          matchValue: merchant.normalizedName,
          targetCategoryId: categoryId,
          isActive: true,
        },
        update: {
          targetCategoryId: categoryId,
          isActive: true,
        },
      });
    } catch {
      // rule upsert non-blocking
    }
  }

  // Run atomic transaction creation
  const transaction = await prisma.$transaction(async (tx) => {
    const createdTx = await tx.transaction.create({
      data: {
        userId,
        merchantId: merchant.id,
        receiptId: receipt.id,
        categoryId: categoryId || null,
        date: new Date(input.date),
        amount: input.amount,
        currency: input.currency || "USD",
        paymentMethod: input.paymentMethod || "UNKNOWN",
        notes: input.notes,
        source: "RECEIPT",
        items: {
          create: (input.items || []).map((item) => ({
            name: item.name,
            quantity: item.quantity ? Number(item.quantity) : null,
            unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
            totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
          })),
        },
      },
      include: {
        merchant: true,
        category: true,
        items: true,
      },
    });

    await tx.receipt.update({
      where: { id: receipt.id },
      data: {
        status: "COMPLETED",
        processedAt: new Date(),
      },
    });

    return createdTx;
  });

  return transaction;
}

export async function getUserReceipts(userId: string) {
  return prisma.receipt.findMany({
    where: { userId },
    include: {
      transaction: {
        include: {
          merchant: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReceiptById(userId: string, receiptId: string) {
  return prisma.receipt.findFirst({
    where: { id: receiptId, userId },
    include: {
      transaction: {
        include: {
          merchant: true,
          category: true,
          items: true,
        },
      },
    },
  });
}

export async function retryReceiptProcessing(userId: string, receiptId: string) {
  const receipt = await prisma.receipt.findFirst({
    where: { id: receiptId, userId },
  });

  if (!receipt) throw new Error("Receipt not found");
  if (receipt.status === "COMPLETED") throw new Error("Receipt is already completed");

  try {
    const buffer = await fs.readFile(receipt.storageKey);

    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: "PROCESSING",
        attemptCount: { increment: 1 },
      },
    });

    const ocrProvider = getOCRProvider(receipt.ocrProvider as any);
    const ocrResult = await ocrProvider.extractText({
      buffer,
      mimeType: receipt.mimeType,
      filename: receipt.filename,
    });

    const aiProvider = getReceiptAIProvider();
    const parsedData = await aiProvider.parseReceipt({
      ocrText: ocrResult.text,
      imageBuffer: buffer,
      mimeType: receipt.mimeType,
    });

    return prisma.receipt.update({
      where: { id: receiptId },
      data: {
        ocrText: ocrResult.text,
        extractedData: parsedData as any,
        status: "NEEDS_REVIEW",
        errorCode: null,
        errorMessage: null,
      },
    });
  } catch (error) {
    return prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: "FAILED",
        errorCode: "RETRY_FAILED",
        errorMessage: error instanceof Error ? error.message : "Retry failed",
      },
    });
  }
}

export async function deleteReceipt(userId: string, receiptId: string) {
  const receipt = await prisma.receipt.findFirst({
    where: { id: receiptId, userId },
  });

  if (!receipt) throw new Error("Receipt not found");

  // Attempt to delete physical file
  try {
    await fs.unlink(receipt.storageKey);
  } catch {}

  return prisma.receipt.delete({
    where: { id: receiptId },
  });
}
