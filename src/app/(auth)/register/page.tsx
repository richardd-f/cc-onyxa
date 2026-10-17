"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [currency, setCurrency] = React.useState("USD");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all required fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, currency }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-xl border-slate-200/90 dark:border-slate-800">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>
          Start tracking expenses with AI receipt intelligence
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            placeholder="Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="h-4 w-4" />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Password (min 6 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            required
          />

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

          <Button
            type="submit"
            variant="emerald"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <p className="text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
