import { requireAuth } from "@/lib/auth/session";
import { getOrGenerateInsights } from "@/features/insights/services/insights.service";
import { InsightsView } from "@/features/insights/components/insights-view";

export default async function InsightsPage() {
  const user = await requireAuth();
  const rawInsights = await getOrGenerateInsights(user.id, false);

  const insights = rawInsights.map((insight) => ({
    ...insight,
    evidence:
      insight.evidence !== null &&
      typeof insight.evidence === "object" &&
      !Array.isArray(insight.evidence)
        ? (insight.evidence as Record<string, unknown>)
        : null,
  }));

  return <InsightsView initialInsights={insights} />;
}
