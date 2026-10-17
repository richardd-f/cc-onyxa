import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function updateUserSettings(
  userId: string,
  data: {
    name?: string;
    currency?: string;
    locale?: string;
    timezone?: string;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      currency: data.currency,
      locale: data.locale,
      timezone: data.timezone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      locale: true,
      timezone: true,
    },
  });
}

export async function changeUserPassword(
  userId: string,
  currentPass: string,
  newPass: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    throw new Error("Password cannot be updated for this account");
  }

  const isValid = await verifyPassword(currentPass, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const newHash = await hashPassword(newPass);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}

export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      currency: true,
      locale: true,
      timezone: true,
      createdAt: true,
    },
  });

  const [transactions, receipts, merchants, categories, insights] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      include: {
        merchant: true,
        category: true,
        items: true,
      },
    }),
    prisma.receipt.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        fileSize: true,
        status: true,
        uploadedAt: true,
        processedAt: true,
        extractedData: true,
      },
    }),
    prisma.merchant.findMany({
      where: { userId },
    }),
    prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId }] },
    }),
    prisma.financialInsight.findMany({
      where: { userId },
    }),
  ]);

  return {
    exportDate: new Date().toISOString(),
    version: "1.0",
    user,
    transactions,
    receipts,
    merchants,
    categories,
    insights,
  };
}

export async function deleteUserAccount(userId: string) {
  return prisma.user.delete({
    where: { id: userId },
  });
}
