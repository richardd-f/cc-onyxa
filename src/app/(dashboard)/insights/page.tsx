import { requireAuth } from "@/lib/auth/session";
import { getOrGenerateInsights } from "@/features/insights/services/insights.service";
import { InsightsView } from "@/features/insights/components/insights-view";

export default async function InsightsPage() {
  const user = await requireAuth();
  const insights = await getOrGenerateInsights(user.id, false);

  return <InsightsView initialInsights={insights as any} />;
}
