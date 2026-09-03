"use server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export async function registerUser(
  email: string,
  password: string,
  name: string,
  id_number: string,
  year_level: number,
): ActionResult<{ message: string }> {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return { ok: false, error: "CONFLICT", message: "Email already in use" };

    await prisma.user.create({
      data: {
        email,
        year_level,
        id_number,
        name,
        password: await bcrypt.hash(password, 10),
      },
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
