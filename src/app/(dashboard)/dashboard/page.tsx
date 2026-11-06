import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Business workspace</CardTitle>
        <CardDescription>Onyxa is being prepared for MSME business tracking.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Business tracking features are not available yet. You can manage your account and preferences in settings.
        </p>
        <Link href="/settings" className="self-start text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
          Open settings
        </Link>
      </CardContent>
    </Card>
  );
}
