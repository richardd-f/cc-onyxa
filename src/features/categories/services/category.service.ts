import { prisma } from "@/lib/db/prisma";

export async function getUserCategories(userId: string) {
  return prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId }],
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });
}

export async function resolveCategoryForMerchant(
  userId: string,
  merchantName: string,
  suggestedCategoryName?: string | null
) {
  const normalizedMerchant = merchantName.trim().toLowerCase();

  // 1. Check user category rules
  const userRule = await prisma.userCategoryRule.findFirst({
    where: {
      userId,
      isActive: true,
      matchValue: normalizedMerchant,
    },
    include: { targetCategory: true },
    orderBy: { priority: "desc" },
  });

  if (userRule?.targetCategory) {
    return userRule.targetCategory.id;
  }

  // 2. Check previous transaction for same merchant by this user
  const previousTx = await prisma.transaction.findFirst({
    where: {
      userId,
      merchant: { normalizedName: normalizedMerchant },
      categoryId: { not: null },
    },
    select: { categoryId: true },
    orderBy: { date: "desc" },
  });

  if (previousTx?.categoryId) {
    return previousTx.categoryId;
  }

  // 3. Match suggested category name from AI
  if (suggestedCategoryName) {
    const matched = await prisma.category.findFirst({
      where: {
        OR: [{ userId: null }, { userId }],
        name: { equals: suggestedCategoryName, mode: "insensitive" },
      },
    });
    if (matched) return matched.id;
  }

  // 4. Default fallback category ("Others")
  const defaultCat = await prisma.category.findFirst({
    where: { slug: "others" },
  });

  return defaultCat?.id || null;
}
