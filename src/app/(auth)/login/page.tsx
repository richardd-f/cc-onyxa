"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("demo@spendwise.ai");
    setPassword("password123");
    setError(null);
  };

  return (
    <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-xl border-slate-200/90 dark:border-slate-800">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your private financial workspace
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200/80 rounded-xl dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            required
          />

          <Button
            type="submit"
            variant="emerald"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100/50 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Fill Demo Credentials (demo@spendwise.ai)</span>
            </button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
