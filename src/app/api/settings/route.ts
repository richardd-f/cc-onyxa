import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateUserSettings } from "@/features/settings/services/settings.service";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(1).optional(),
  currency: z.string().min(3).max(3).optional(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
});

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
    }

    const updated = await updateUserSettings(user.id, parsed.data);
    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
