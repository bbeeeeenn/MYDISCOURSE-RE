"use server";

import bcrypt from "bcryptjs";
import { profilePage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function updatePassword(
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   const userId = session?.user.id;
   if (!userId) return { ok: false, error: "AUTH", message: "Please sign in" };

   const currentPassword = String(formData.get("currentPassword") ?? "");
   const password = String(formData.get("password") ?? "");
   const confirmPassword = String(formData.get("confirmPassword") ?? "");

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
         select: { password: true },
      });
      if (!user) {
         return { ok: false, error: "NOT_FOUND", message: "User not found" };
      }

      if (user.password) {
         if (!currentPassword) {
            return {
               ok: false,
               error: "VALIDATION",
               message: "Current password is required",
            };
         }

         const isCurrentPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password,
         );
         if (!isCurrentPasswordValid) {
            return {
               ok: false,
               error: "VALIDATION",
               message: "Current password is incorrect",
            };
         }
      }

      await prisma.user.update({
         where: { id: userId },
         data: { password: await bcrypt.hash(password, 10) },
      });

      revalidatePath(profilePage);
      return {
         ok: true,
         data: {
            message: user.password
               ? "Password changed successfully"
               : "Password set successfully",
         },
      };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to update password",
      };
   }
}
