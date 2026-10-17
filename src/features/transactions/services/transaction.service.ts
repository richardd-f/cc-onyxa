import { prisma } from "@/lib/db/prisma";
import { findOrCreateMerchant } from "@/features/merchants/services/merchant.service";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "../schemas/transaction.schema";
import { PaymentMethod, TransactionSource } from "@prisma/client";

export async function listTransactions(userId: string, filters: TransactionFilterInput) {
  const {
    search,
    categoryId,
    paymentMethod,
    source,
    startDate,
    endDate,
    sortBy = "date",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = filters;

  const where: any = { userId };

  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
      { merchant: { displayName: { contains: q, mode: "insensitive" } } },
      { items: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  if (paymentMethod && paymentMethod !== "ALL") {
    where.paymentMethod = paymentMethod as PaymentMethod;
  }

  if (source && source !== "ALL") {
    where.source = source as TransactionSource;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) {
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      where.date.lte = endD;
    }
  }

  const skip = (page - 1) * limit;

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        merchant: true,
        category: true,
        receipt: {
          select: {
            id: true,
            filename: true,
            fileUrl: true,
            status: true,
          },
        },
        items: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function getTransactionById(userId: string, id: string) {
  return prisma.transaction.findFirst({
    where: { id, userId },
    include: {
      merchant: true,
      category: true,
      receipt: true,
      items: true,
    },
  });
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  const merchant = await findOrCreateMerchant(userId, input.merchantName);

  return prisma.transaction.create({
    data: {
      userId,
      merchantId: merchant.id,
      categoryId: input.categoryId || null,
      date: new Date(input.date),
      amount: input.amount,
      currency: input.currency || "USD",
      paymentMethod: input.paymentMethod || "UNKNOWN",
      description: input.description,
      notes: input.notes,
      source: input.source || "MANUAL",
      items: {
        create: (input.items || []).map((item) => ({
          name: item.name,
          quantity: item.quantity ? Number(item.quantity) : null,
          unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
          totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
          sku: item.sku,
        })),
      },
    },
    include: {
      merchant: true,
      category: true,
      items: true,
    },
  });
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: UpdateTransactionInput
) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Transaction not found or unauthorized");
  }

  let merchantId = existing.merchantId;
  if (input.merchantName) {
    const merchant = await findOrCreateMerchant(userId, input.merchantName);
    merchantId = merchant.id;
  }

  return prisma.$transaction(async (tx) => {
    // If items are provided, replace them
    if (input.items !== undefined) {
      await tx.transactionItem.deleteMany({
        where: { transactionId: id },
      });
      if (input.items.length > 0) {
        await tx.transactionItem.createMany({
          data: input.items.map((item) => ({
            transactionId: id,
            name: item.name,
            quantity: item.quantity ? Number(item.quantity) : null,
            unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
            totalPrice: item.totalPrice ? Number(item.totalPrice) : null,
            sku: item.sku,
          })),
        });
      }
    }

    return tx.transaction.update({
      where: { id },
      data: {
        merchantId,
        categoryId: input.categoryId !== undefined ? input.categoryId : existing.categoryId,
        date: input.date ? new Date(input.date) : existing.date,
        amount: input.amount !== undefined ? input.amount : existing.amount,
        currency: input.currency || existing.currency,
        paymentMethod: input.paymentMethod || existing.paymentMethod,
        description: input.description !== undefined ? input.description : existing.description,
        notes: input.notes !== undefined ? input.notes : existing.notes,
      },
      include: {
        merchant: true,
        category: true,
        items: true,
      },
    });
  });
}

export async function deleteTransaction(userId: string, id: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error("Transaction not found or unauthorized");
  }

  return prisma.transaction.delete({
    where: { id },
  });
}
