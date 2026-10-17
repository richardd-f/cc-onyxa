import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserCategories } from "@/features/categories/services/category.service";
import { AppShell } from "@/components/layout/app-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const categories = await getUserCategories(user.id);

  return (
    <AppShell
      user={user}
      categories={categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))}
    >
      {children}
    </AppShell>
  );
}
