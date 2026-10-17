import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/db/prisma";
import { InsightType, Prisma } from "@prisma/client";
import { detectSpendingHabits } from "@/features/spending-habits/services/habits.service";
import { getDetailedAnalytics } from "@/features/analytics/services/analytics.service";
import { generatedInsightsResponseSchema, GeneratedInsightItem } from "../schemas/insight.schema";
import { subHours } from "date-fns";

export async function getUserInsights(userId: string) {
  return prisma.financialInsight.findMany({
    where: {
      userId,
      isDismissed: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function dismissInsight(userId: string, insightId: string) {
  return prisma.financialInsight.updateMany({
    where: { id: insightId, userId },
    data: { isDismissed: true },
  });
}

export async function getOrGenerateInsights(userId: string, forceRefresh = false) {
  // 1. Check for cached insights generated within last 24 hours
  if (!forceRefresh) {
    const existing = await prisma.financialInsight.findMany({
      where: {
        userId,
        isDismissed: false,
        createdAt: { gte: subHours(new Date(), 24) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing.length > 0) {
      return existing;
    }
  }

  // 2. Compute verified backend statistics
  const [habits, monthlyAnalytics, weeklyAnalytics] = await Promise.all([
    detectSpendingHabits(userId),
    getDetailedAnalytics(userId, "this_month"),
    getDetailedAnalytics(userId, "this_week"),
  ]);

  // If user has zero transactions, return empty state early
  if (habits.totalTransactionsAnalyzed === 0) {
    return [];
  }

  // 3. Prepare compact, verified numerical payload
  const statsPayload = {
    monthly: {
      currentTotal: monthlyAnalytics.currentTotal,
      previousTotal: monthlyAnalytics.previousTotal,
      diffPercentage: monthlyAnalytics.totalComparison.percentageChange,
      isIncrease: monthlyAnalytics.totalComparison.isIncrease,
      topCategories: monthlyAnalytics.categoryComparisons.slice(0, 3).map((c) => ({
        category: c.categoryName,
        currentSpend: c.currentAmount,
        diffPct: c.comparison.percentageChange,
      })),
      topMerchants: monthlyAnalytics.merchantComparisons.slice(0, 3).map((m) => ({
        merchant: m.merchantName,
        currentSpend: m.currentAmount,
      })),
    },
    habits: {
      frequentMerchants: habits.frequentMerchants.slice(0, 3).map((m) => ({
        merchant: m.name,
        visits: m.visitCount,
        totalSpent: m.totalSpent,
      })),
      weekendVsWeekday: habits.weekendVsWeekday,
      hasSufficientData: habits.hasSufficientData,
    },
    weekly: {
      currentTotal: weeklyAnalytics.currentTotal,
      previousTotal: weeklyAnalytics.previousTotal,
      diffPercentage: weeklyAnalytics.totalComparison.percentageChange,
    },
  };

  let insightItems: GeneratedInsightItem[] = [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a financial advisor explaining spending trends to a user.
Here is the user's VERIFIED backend financial statistics:
${JSON.stringify(statsPayload, null, 2)}

TASK:
Generate 2 to 4 actionable, practical financial insights based strictly on these verified numbers.
DO NOT invent transactions or amounts. All figures mentioned must match the provided statistics.

Format as a valid JSON object:
{
  "insights": [
    {
      "type": "SPENDING_INCREASE" | "SPENDING_DECREASE" | "RECURRING_HABIT" | "CATEGORY_CONCENTRATION" | "MERCHANT_CONCENTRATION" | "UNUSUAL_ACTIVITY" | "SAVING_OPPORTUNITY",
      "title": "Clear, concise title",
      "description": "Explanation referencing the verified numbers",
      "recommendation": "Practical, gentle recommendation",
      "evidence": { "key": "value" }
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      const validation = generatedInsightsResponseSchema.safeParse(parsed);

      if (validation.success && validation.data.insights.length > 0) {
        insightItems = validation.data.insights;
      }
    } catch (err) {
      console.warn("Gemini insight generation failed, using fallback heuristic rules:", err);
    }
  }

  // 4. Fallback deterministic heuristic rules if AI was not configured or threw error
  if (insightItems.length === 0) {
    insightItems = generateHeuristicInsights(statsPayload);
  }

  // 5. Invalidate existing old insights on force refresh
  if (forceRefresh) {
    await prisma.financialInsight.deleteMany({
      where: { userId },
    });
  }

  // 6. Save generated insights into database
  await prisma.financialInsight.createMany({
    data: insightItems.map((item) => ({
      userId,
      type: item.type as InsightType,
      title: item.title,
      description: item.recommendation ? `${item.description} Tip: ${item.recommendation}` : item.description,
      evidence: item.evidence as Prisma.InputJsonValue,
    })),
  });

  return prisma.financialInsight.findMany({
    where: { userId, isDismissed: false },
    orderBy: { createdAt: "desc" },
  });
}

interface StatsPayloadType {
  monthly: {
    currentTotal: number;
    previousTotal: number;
    diffPercentage: number | null;
    isIncrease: boolean;
    topCategories: Array<{ category: string; currentSpend: number; diffPct: number | null }>;
    topMerchants: Array<{ merchant: string; currentSpend: number }>;
  };
  habits: {
    frequentMerchants: Array<{ merchant: string; visits: number; totalSpent: number }>;
    weekendVsWeekday: {
      weekdayTotal: number;
      weekendTotal: number;
      weekdayAvgDaily: number;
      weekendAvgDaily: number;
      weekendHigher: boolean;
    };
    hasSufficientData: boolean;
  };
  weekly: {
    currentTotal: number;
    previousTotal: number;
    diffPercentage: number | null;
  };
}

function generateHeuristicInsights(stats: StatsPayloadType): GeneratedInsightItem[] {
  const items: GeneratedInsightItem[] = [];

  // Insight 1: Monthly spending trend
  if (stats.monthly.diffPercentage !== null && Math.abs(stats.monthly.diffPercentage) > 5) {
    const isUp = stats.monthly.isIncrease;
    items.push({
      type: isUp ? "SPENDING_INCREASE" : "SPENDING_DECREASE",
      title: isUp
        ? `Monthly spending rose by ${stats.monthly.diffPercentage}%`
        : `Monthly spending dropped by ${Math.abs(stats.monthly.diffPercentage)}%`,
      description: `Your spending this month is $${stats.monthly.currentTotal.toFixed(2)} compared to $${stats.monthly.previousTotal.toFixed(2)} in the previous period.`,
      recommendation: isUp
        ? "Review your top categories to see where adjustments can be made."
        : "Great job keeping spending below your previous benchmark!",
      evidence: {
        currentTotal: stats.monthly.currentTotal,
        previousTotal: stats.monthly.previousTotal,
        diffPercentage: stats.monthly.diffPercentage,
      },
    });
  }

  // Insight 2: Category concentration
  if (stats.monthly.topCategories.length > 0) {
    const topCat = stats.monthly.topCategories[0];
    const pct = stats.monthly.currentTotal > 0
      ? Math.round((topCat.currentSpend / stats.monthly.currentTotal) * 100)
      : 0;

    items.push({
      type: "CATEGORY_CONCENTRATION",
      title: `${topCat.category} leads your monthly expenses (${pct}%)`,
      description: `You have spent $${topCat.currentSpend.toFixed(2)} on ${topCat.category} so far this period.`,
      recommendation: "Setting a category budget target can help maintain steady cash flow.",
      evidence: {
        category: topCat.category,
        spend: topCat.currentSpend,
        percentageOfTotal: pct,
      },
    });
  }

  // Insight 3: Frequent merchant visits
  if (stats.habits.frequentMerchants.length > 0) {
    const topMerchant = stats.habits.frequentMerchants[0];
    if (topMerchant.visits >= 2) {
      items.push({
        type: "RECURRING_HABIT",
        title: `Regular purchases at ${topMerchant.merchant}`,
        description: `You have made ${topMerchant.visits} purchases at ${topMerchant.merchant} totaling $${topMerchant.totalSpent.toFixed(2)}.`,
        recommendation: "Consider loyalty memberships or digital gift cards to maximize rewards.",
        evidence: {
          merchant: topMerchant.merchant,
          visits: topMerchant.visits,
          totalSpent: topMerchant.totalSpent,
        },
      });
    }
  }

  // Insight 4: Weekend vs weekday
  if (stats.habits.weekendVsWeekday.weekendHigher) {
    items.push({
      type: "SAVING_OPPORTUNITY",
      title: "Higher average spending on weekends",
      description: `Your average daily weekend spending is higher than typical weekday expenses.`,
      recommendation: "Planning dining and leisure activities on Friday can prevent impulsive weekend overspending.",
      evidence: stats.habits.weekendVsWeekday,
    });
  }

  return items;
}
