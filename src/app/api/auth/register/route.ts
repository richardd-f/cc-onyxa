import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  currency: z.string().default("USD"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { name, email, password, currency } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        currency: currency || "USD",
        locale: "en-US",
        timezone: "America/New_York",
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
      },
    });

    await setSessionCookie({ userId: newUser.id, email: newUser.email });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Failed to register account" }, { status: 500 });
  }
}
