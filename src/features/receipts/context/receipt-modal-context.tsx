"use client";

import * as React from "react";

interface ReceiptModalContextType {
  isOpen: boolean;
  openScanModal: () => void;
  closeScanModal: () => void;
  reviewReceiptId: string | null;
  openReviewModal: (receiptId: string) => void;
}

const ReceiptModalContext = React.createContext<ReceiptModalContextType | undefined>(undefined);

export function ReceiptModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [reviewReceiptId, setReviewReceiptId] = React.useState<string | null>(null);

  const openScanModal = () => {
    setReviewReceiptId(null);
    setIsOpen(true);
  };

  const closeScanModal = () => {
    setIsOpen(false);
    setReviewReceiptId(null);
  };

  const openReviewModal = (receiptId: string) => {
    setReviewReceiptId(receiptId);
    setIsOpen(true);
  };

  return (
    <ReceiptModalContext.Provider
      value={{
        isOpen,
        openScanModal,
        closeScanModal,
        reviewReceiptId,
        openReviewModal,
      }}
    >
      {children}
    </ReceiptModalContext.Provider>
  );
}

export function useReceiptModal() {
  const context = React.useContext(ReceiptModalContext);
  if (!context) {
    throw new Error("useReceiptModal must be used within a ReceiptModalProvider");
  }
  return context;
}
