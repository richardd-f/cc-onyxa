import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getUserInsights,
  getOrGenerateInsights,
  dismissInsight,
} from "@/features/insights/services/insights.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const insights = await getOrGenerateInsights(user.id, false);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    if (body.action === "dismiss" && body.insightId) {
      await dismissInsight(user.id, body.insightId);
      const remaining = await getUserInsights(user.id);
      return NextResponse.json({ success: true, insights: remaining });
    }

    // Default: force regenerate
    const insights = await getOrGenerateInsights(user.id, true);
    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("Insights refresh error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}
