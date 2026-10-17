import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { exportUserData } from "@/features/settings/services/settings.service";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await exportUserData(user.id);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="spendwise-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
