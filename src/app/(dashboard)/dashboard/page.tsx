import { requireAuth } from "@/lib/auth/session";
import { getDashboardOverview, PeriodType } from "@/features/dashboard/services/dashboard.service";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const period = (params.period as PeriodType) || "this_month";

  const overviewData = await getDashboardOverview(user.id, period, params.start, params.end);

  return (
    <DashboardView
      initialData={overviewData}
      currency={user.currency || "USD"}
      currentPeriod={period}
    />
  );
}
