"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";
import { MobileDrawer } from "./mobile-drawer";
import {
  ReceiptModalProvider,
  useReceiptModal,
} from "@/features/receipts/context/receipt-modal-context";
import { ReceiptScannerModal } from "@/features/receipts/components/receipt-scanner-modal";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email: string;
    image?: string | null;
    currency?: string;
  } | null;
  categories?: Array<{ id: string; name: string; color?: string | null }>;
  headerTitle?: string;
  headerSubtitle?: string;
}

function ShellInner({
  children,
  user,
  categories = [],
  headerTitle,
  headerSubtitle,
}: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const { isOpen, openScanModal, closeScanModal, reviewReceiptId } = useReceiptModal();

  return (
    <div className="flex flex-row min-h-screen w-full bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Desktop Sidebar */}
      <Sidebar user={user} onOpenScanModal={openScanModal} />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onOpenScanModal={openScanModal}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
          onOpenScanModal={openScanModal}
        />

        <main className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* AI Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isOpen}
        onClose={closeScanModal}
        initialReceiptId={reviewReceiptId}
        categories={categories}
      />
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <ReceiptModalProvider>
      <ShellInner {...props} />
    </ReceiptModalProvider>
  );
}
