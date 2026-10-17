import { requireAuth } from "@/lib/auth/session";
import { getDetailedAnalytics } from "@/features/analytics/services/analytics.service";
import { detectSpendingHabits } from "@/features/spending-habits/services/habits.service";
import { AnalyticsView } from "@/features/analytics/components/analytics-view";
import { PeriodType } from "@/features/dashboard/services/dashboard.service";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const period = (params.period as PeriodType) || "this_month";

  const [analytics, habits] = await Promise.all([
    getDetailedAnalytics(user.id, period),
    detectSpendingHabits(user.id),
  ]);

  return (
    <AnalyticsView
      analytics={analytics}
      habits={habits}
      currentPeriod={period}
      currency={user.currency || "USD"}
    />
  );
}
