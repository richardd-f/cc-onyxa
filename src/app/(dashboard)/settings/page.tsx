import { requireAuth } from "@/lib/auth/session";
import { SettingsView } from "@/features/settings/components/settings-view";

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <SettingsView
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency || "USD",
        locale: user.locale || "en-US",
        timezone: user.timezone || "America/New_York",
      }}
    />
  );
}
