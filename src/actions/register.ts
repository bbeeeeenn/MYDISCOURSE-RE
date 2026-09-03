"use server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { signIn } from "@/lib/auth";

export async function registerUser(
  email: string,
  password: string,
): ActionResult<{ message: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPassword = password.trim();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return { ok: false, error: "CONFLICT", message: "Email already in use" };

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: await bcrypt.hash(normalizedPassword, 10),
      },
    });

    await signIn("credentials", {
      email: normalizedEmail,
      password: normalizedPassword,
      redirect: false,
    });

    return { ok: true, data: { message: "You are registered successfully!" } }; // suggest message
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return { ok: false, error: "DATABASE", message: e.message };
    }
    console.error(e);
    return { ok: false, error: "OTHER", message: "Unexpected error" };
  }
}
