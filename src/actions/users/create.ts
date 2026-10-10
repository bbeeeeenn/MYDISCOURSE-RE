"use server";

import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";
import { usersPage } from "@/constants";

export default async function createUser(
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   if (session?.user.role !== "ADMIN") {
      return { ok: false, error: "FORBIDDEN", message: "Unauthorized" };
   }

   const name = String(formData.get("name") ?? "").trim();
   const email = String(formData.get("email") ?? "").trim().toLowerCase();
   const password = String(formData.get("password") ?? "");
   const confirmPassword = String(formData.get("confirmPassword") ?? "");
   const roleValue = String(formData.get("role") ?? "");

   if (!name) {
      return { ok: false, error: "VALIDATION", message: "Name is required" };
   }

   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "A valid email is required",
      };
   }

   if (password.length < 8) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Password must be at least 8 characters",
      };
   }

   if (password !== confirmPassword) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Passwords do not match",
      };
   }

   if (!Object.values(Role).includes(roleValue as Role)) {
      return { ok: false, error: "VALIDATION", message: "A valid role is required" };
   }

   try {
      await prisma.user.create({
         data: {
            name,
            email,
            password: await bcrypt.hash(password, 10),
            role: roleValue as Role,
         },
      });

      revalidatePath(usersPage);
      return { ok: true, data: { message: "Account created successfully" } };
   } catch (error) {
      if (
         error instanceof PrismaClientKnownRequestError &&
         error.code === "P2002"
      ) {
         return { ok: false, error: "CONFLICT", message: "Email already in use" };
      }

      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to create account",
      };
   }
}
