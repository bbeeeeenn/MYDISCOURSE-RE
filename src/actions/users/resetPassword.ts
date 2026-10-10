"use server";

import bcrypt from "bcryptjs";
import { usersPage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function resetUserPassword(
   id: string,
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   if (session?.user.role !== "ADMIN") {
      return { ok: false, error: "FORBIDDEN", message: "Unauthorized" };
   }

   const userId = id.trim();
   const password = String(formData.get("password") ?? "");
   const confirmPassword = String(formData.get("confirmPassword") ?? "");

   if (!userId) {
      return { ok: false, error: "VALIDATION", message: "User ID is required" };
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

   try {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         select: { id: true },
      });
      if (!user) {
         return { ok: false, error: "NOT_FOUND", message: "User not found" };
      }

      await prisma.user.update({
         where: { id: userId },
         data: { password: await bcrypt.hash(password, 10) },
      });

      revalidatePath(usersPage);
      return { ok: true, data: { message: "Password reset successfully" } };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to reset password",
      };
   }
}
