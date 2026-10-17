"use client";

import * as React from "react";
import { User, Globe, Download, Trash2, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";

interface SettingsViewProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    currency: string;
    locale: string;
    timezone: string;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [name, setName] = React.useState(user.name || "");
  const [currency, setCurrency] = React.useState(user.currency || "USD");
  const [locale, setLocale] = React.useState(user.locale || "en-US");
  const [timezone, setTimezone] = React.useState(user.timezone || "America/New_York");
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setFeedbackMsg(null);

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currency, locale, timezone }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setFeedbackMsg("Profile and preferences saved successfully!");
      router.refresh();
    } catch (err) {
      alert("Error saving preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    window.location.href = "/api/settings/export";
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch("/api/settings/delete-account", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Deletion failed");

      router.push("/login");
      router.refresh();
    } catch {
      alert("Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl w-full">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Account & Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize currency display, regional defaults, data backups, and security
        </p>
      </div>

      {feedbackMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Profile Form Card */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Profile & Currency Settings</CardTitle>
          <CardDescription>
            Configure your personal information and display currency
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Email (Account ID)"
                  value={user.email}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800/60 opacity-80"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select
                  label="Preferred Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="IDR">IDR (Rp) - Indonesian Rupiah</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                </Select>
              </div>

              <div className="flex-1">
                <Select
                  label="Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/New_York">Eastern Time (America/New_York)</option>
                  <option value="America/Chicago">Central Time (America/Chicago)</option>
                  <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Asia/Jakarta">Jakarta (WIB)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="UTC">UTC</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="submit" variant="emerald" size="md" isLoading={isSaving}>
                Save Preferences
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data Export Card */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-3">
          <CardTitle>Data Export & Portability</CardTitle>
          <CardDescription>
            Download a complete backup archive of all your expenses, line items, merchants, and receipts in JSON format.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 max-w-md">
            Your export contains all transactions, metadata, parsed OCR structures, and categories safely exported from PostgreSQL.
          </div>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1.5" />
            <span>Export Archive (.json)</span>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 border-rose-200 dark:border-rose-900/50">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-rose-600">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated financial records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-500 max-w-md">
            Once deleted, all receipts, transactions, line items, and financial insights are permanently wiped.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            <span>Delete Account</span>
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal (with Blurred Backdrop) */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete SpendWise Account?"
        description="This action is irreversible. All your transactions, receipts, and insights will be permanently deleted."
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>All your financial data will be permanently wiped.</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Confirm Permanent Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
