import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie } from "@/lib/auth/session";
import { deleteUserAccount } from "@/features/settings/services/settings.service";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await deleteUserAccount(user.id);
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
