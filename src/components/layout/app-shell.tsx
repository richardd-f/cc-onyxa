"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";
import { MobileDrawer } from "./mobile-drawer";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email: string;
    image?: string | null;
    currency?: string;
  } | null;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function AppShell({
  children,
  user,
  headerTitle,
  headerSubtitle,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <div className="flex flex-row min-h-screen w-full bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Desktop Sidebar */}
      <Sidebar user={user} />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
        />

        <main className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
