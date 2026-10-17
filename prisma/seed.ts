import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const DEFAULT_CATEGORIES = [
  { name: "Food & Beverage", slug: "food-beverage", icon: "UtensilsCrossed", color: "#F59E0B", description: "Restaurants, cafes, bars, and dining out" },
  { name: "Groceries", slug: "groceries", icon: "ShoppingBag", color: "#10B981", description: "Supermarkets, grocery stores, produce markets" },
  { name: "Transportation", slug: "transportation", icon: "Car", color: "#3B82F6", description: "Gas, public transit, rideshare, parking" },
  { name: "Shopping", slug: "shopping", icon: "Tag", color: "#EC4899", description: "Clothing, electronics, home goods, retail" },
  { name: "Healthcare", slug: "healthcare", icon: "HeartPulse", color: "#EF4444", description: "Doctor visits, pharmacy, dental, fitness" },
  { name: "Education", slug: "education", icon: "GraduationCap", color: "#8B5CF6", description: "Tuition, books, online courses, training" },
  { name: "Entertainment", slug: "entertainment", icon: "Film", color: "#F97316", description: "Movies, concerts, streaming services, games" },
  { name: "Utilities", slug: "utilities", icon: "Zap", color: "#06B6D4", description: "Electricity, water, internet, cell phone" },
  { name: "Others", slug: "others", icon: "CircleEllipsis", color: "#6B7280", description: "Miscellaneous expenses" },
];

async function main() {
  console.log("Seeding database...");

  // 1. Seed System Categories
  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { userId: null, slug: cat.slug },
    });
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          color: cat.color,
          description: cat.description,
          isSystem: true,
          userId: null,
        },
      });
    }
  }
  console.log("System categories seeded.");

  // 2. Seed Demo User
  const demoEmail = "demo@spendwise.ai";
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: "Alex Morgan",
        email: demoEmail,
        passwordHash,
        currency: "USD",
        locale: "en-US",
        timezone: "America/New_York",
      },
    });
    console.log(`Demo user created with ID: ${demoUser.id}`);
  } else {
    demoUser = await prisma.user.update({
      where: { id: demoUser.id },
      data: { passwordHash },
    });
    console.log(`Demo user updated: ${demoUser.id}`);
  }

  // 3. Clear existing user transactions and merchants for fresh seed if needed
  const txCount = await prisma.transaction.count({ where: { userId: demoUser.id } });
  if (txCount > 0) {
    console.log(`User already has ${txCount} transactions. Skipping demo transactions.`);
    return;
  }

  // Categories map
  const categories = await prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId: demoUser.id }] },
  });
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  // 4. Seed Merchants
  const merchantNames = [
    { norm: "starbucks", display: "Starbucks Coffee" },
    { norm: "whole foods", display: "Whole Foods Market" },
    { norm: "uber", display: "Uber Rides" },
    { norm: "apple store", display: "Apple Store" },
    { norm: "cvs pharmacy", display: "CVS Pharmacy" },
    { norm: "netflix", display: "Netflix" },
    { norm: "con edison", display: "Con Edison Power" },
    { norm: "trader joes", display: "Trader Joe's" },
    { norm: "shell gas", display: "Shell Oil" },
  ];

  const merchantMap = new Map<string, string>();
  for (const m of merchantNames) {
    const created = await prisma.merchant.upsert({
      where: {
        userId_normalizedName: {
          userId: demoUser.id,
          normalizedName: m.norm,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        normalizedName: m.norm,
        displayName: m.display,
      },
    });
    merchantMap.set(m.norm, created.id);
  }

  // 5. Seed Transactions with line items across the last 30 days
  const now = new Date();
  const sampleTransactions = [
    {
      merchantNorm: "whole foods",
      catSlug: "groceries",
      amount: 142.85,
      dateOffsetDays: 1,
      paymentMethod: "CREDIT_CARD" as const,
      source: "RECEIPT" as const,
      description: "Weekly family grocery haul",
      items: [
        { name: "Organic Honeycrisp Apples", quantity: 3, unitPrice: 2.99, totalPrice: 8.97 },
        { name: "Almond Milk 64oz", quantity: 2, unitPrice: 3.49, totalPrice: 6.98 },
        { name: "Wild Caught Salmon Fillet", quantity: 1.8, unitPrice: 16.99, totalPrice: 30.58 },
        { name: "Organic Sourdough Bread", quantity: 1, unitPrice: 5.99, totalPrice: 5.99 },
        { name: "Extra Virgin Olive Oil", quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
      ],
    },
    {
      merchantNorm: "starbucks",
      catSlug: "food-beverage",
      amount: 6.75,
      dateOffsetDays: 1,
      paymentMethod: "E_WALLET" as const,
      source: "RECEIPT" as const,
      description: "Morning iced oat latte",
      items: [{ name: "Iced Brown Sugar Oat Shaken Espresso", quantity: 1, unitPrice: 6.75, totalPrice: 6.75 }],
    },
    {
      merchantNorm: "uber",
      catSlug: "transportation",
      amount: 24.5,
      dateOffsetDays: 2,
      paymentMethod: "CREDIT_CARD" as const,
      source: "MANUAL" as const,
      description: "Ride to downtown conference",
      items: [],
    },
    {
      merchantNorm: "starbucks",
      catSlug: "food-beverage",
      amount: 7.25,
      dateOffsetDays: 3,
      paymentMethod: "E_WALLET" as const,
      source: "RECEIPT" as const,
      description: "Afternoon matcha latte",
      items: [{ name: "Iced Matcha Latte Grande", quantity: 1, unitPrice: 7.25, totalPrice: 7.25 }],
    },
    {
      merchantNorm: "cvs pharmacy",
      catSlug: "healthcare",
      amount: 38.4,
      dateOffsetDays: 4,
      paymentMethod: "DEBIT_CARD" as const,
      source: "RECEIPT" as const,
      description: "Vitamins and allergy medication",
      items: [
        { name: "Vitamin D3 2000IU", quantity: 1, unitPrice: 14.99, totalPrice: 14.99 },
        { name: "Antihistamine 30ct", quantity: 1, unitPrice: 19.99, totalPrice: 19.99 },
      ],
    },
    {
      merchantNorm: "trader joes",
      catSlug: "groceries",
      amount: 68.2,
      dateOffsetDays: 6,
      paymentMethod: "CREDIT_CARD" as const,
      source: "RECEIPT" as const,
      description: "Midweek snacks and pantry staples",
      items: [
        { name: "Mandarin Orange Chicken", quantity: 2, unitPrice: 4.99, totalPrice: 9.98 },
        { name: "Dark Chocolate Peanut Butter Cups", quantity: 1, unitPrice: 4.49, totalPrice: 4.49 },
        { name: "Cold Brew Concentrate", quantity: 2, unitPrice: 8.99, totalPrice: 17.98 },
      ],
    },
    {
      merchantNorm: "shell gas",
      catSlug: "transportation",
      amount: 52.0,
      dateOffsetDays: 7,
      paymentMethod: "CREDIT_CARD" as const,
      source: "MANUAL" as const,
      description: "Full tank premium gasoline",
      items: [],
    },
    {
      merchantNorm: "starbucks",
      catSlug: "food-beverage",
      amount: 6.75,
      dateOffsetDays: 8,
      paymentMethod: "E_WALLET" as const,
      source: "RECEIPT" as const,
      description: "Morning iced coffee",
      items: [{ name: "Iced Oat Latte Grande", quantity: 1, unitPrice: 6.75, totalPrice: 6.75 }],
    },
    {
      merchantNorm: "con edison",
      catSlug: "utilities",
      amount: 115.6,
      dateOffsetDays: 10,
      paymentMethod: "BANK_TRANSFER" as const,
      source: "MANUAL" as const,
      description: "Monthly electric & gas utility bill",
      items: [],
    },
    {
      merchantNorm: "netflix",
      catSlug: "entertainment",
      amount: 22.99,
      dateOffsetDays: 12,
      paymentMethod: "CREDIT_CARD" as const,
      source: "MANUAL" as const,
      description: "Premium 4K streaming plan subscription",
      items: [],
    },
    {
      merchantNorm: "apple store",
      catSlug: "shopping",
      amount: 199.0,
      dateOffsetDays: 15,
      paymentMethod: "CREDIT_CARD" as const,
      source: "RECEIPT" as const,
      description: "AirPods 4 with Active Noise Cancellation",
      items: [{ name: "AirPods 4 ANC", quantity: 1, unitPrice: 199.0, totalPrice: 199.0 }],
    },
    {
      merchantNorm: "whole foods",
      catSlug: "groceries",
      amount: 128.4,
      dateOffsetDays: 16,
      paymentMethod: "CREDIT_CARD" as const,
      source: "RECEIPT" as const,
      description: "Weekly groceries and organic veggies",
      items: [],
    },
    {
      merchantNorm: "starbucks",
      catSlug: "food-beverage",
      amount: 7.45,
      dateOffsetDays: 18,
      paymentMethod: "E_WALLET" as const,
      source: "RECEIPT" as const,
      description: "Coffee and warm almond croissant",
      items: [],
    },
    {
      merchantNorm: "uber",
      catSlug: "transportation",
      amount: 31.2,
      dateOffsetDays: 21,
      paymentMethod: "CREDIT_CARD" as const,
      source: "MANUAL" as const,
      description: "Late night ride from airport",
      items: [],
    },
    {
      merchantNorm: "whole foods",
      catSlug: "groceries",
      amount: 110.15,
      dateOffsetDays: 25,
      paymentMethod: "CREDIT_CARD" as const,
      source: "RECEIPT" as const,
      description: "Weekly pantry essentials",
      items: [],
    },
  ];

  for (const tx of sampleTransactions) {
    const txDate = new Date(now.getTime() - tx.dateOffsetDays * 24 * 60 * 60 * 1000);
    const categoryId = catMap.get(tx.catSlug);
    const merchantId = merchantMap.get(tx.merchantNorm);

    let receiptId: string | undefined = undefined;
    if (tx.source === "RECEIPT") {
      const receipt = await prisma.receipt.create({
        data: {
          userId: demoUser.id,
          filename: `receipt_${tx.merchantNorm.replace(/\s+/g, "_")}_${tx.dateOffsetDays}d.jpg`,
          mimeType: "image/jpeg",
          fileSize: 245000 + Math.floor(Math.random() * 50000),
          storageKey: `receipts/${demoUser.id}/demo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`,
          status: "COMPLETED",
          ocrProvider: "ocr-space",
          aiProvider: "gemini",
          extractedData: {
            merchant: merchantNames.find((m) => m.norm === tx.merchantNorm)?.display,
            date: txDate.toISOString(),
            total: tx.amount,
            currency: "USD",
            items: tx.items,
          },
          processedAt: txDate,
        },
      });
      receiptId = receipt.id;
    }

    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        merchantId,
        categoryId,
        receiptId,
        date: txDate,
        amount: tx.amount,
        currency: "USD",
        paymentMethod: tx.paymentMethod,
        source: tx.source,
        description: tx.description,
        items: {
          create: tx.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
    });
  }

  // 6. Seed Sample AI Financial Insights
  await prisma.financialInsight.createMany({
    data: [
      {
        userId: demoUser.id,
        type: "RECURRING_HABIT",
        title: "Frequent visits to Starbucks Coffee",
        description: "You visited Starbucks Coffee 4 times over the past 30 days, spending a total of $28.20. Setting a coffee budget or using loyalty rewards could save you roughly $30 monthly.",
        evidence: {
          merchant: "Starbucks Coffee",
          visitCount: 4,
          totalSpent: 28.2,
          period: "Last 30 days",
        },
      },
      {
        userId: demoUser.id,
        type: "CATEGORY_CONCENTRATION",
        title: "Groceries represent 48% of total monthly spend",
        description: "Your grocery purchases at Whole Foods Market and Trader Joe's totaled $349.60, representing almost half of your total expenses. Compare store-brand items to trim up to 15%.",
        evidence: {
          category: "Groceries",
          percentage: 48.2,
          totalAmount: 349.6,
          totalMonthlySpend: 725.34,
        },
      },
      {
        userId: demoUser.id,
        type: "SAVING_OPPORTUNITY",
        title: "Potential Rideshare Optimization",
        description: "You took 2 Uber rides totaling $55.70. For routine airport or conference travel, scheduling rides in advance or utilizing express transit during peak surge hours can reduce costs.",
        evidence: {
          merchant: "Uber Rides",
          totalSpent: 55.7,
          tripCount: 2,
        },
      },
    ],
  });

  console.log("Demo seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
