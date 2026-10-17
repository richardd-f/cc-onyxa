import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">
        The financial report or dashboard section you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button variant="emerald">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Return to Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
