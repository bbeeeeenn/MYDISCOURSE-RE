"use server";

import { profilePage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function updateProfile(
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   const userId = session?.user.id;
   if (!userId) return { ok: false, error: "AUTH", message: "Please sign in" };

   const name = String(formData.get("name") || "").trim();

   if (!name) {
      return { ok: false, error: "VALIDATION", message: "Name is required" };
   }

   try {
      const currentUser = await prisma.user.findUnique({
         where: { id: userId },
         select: { role: true },
      });
      if (!currentUser) {
         return { ok: false, error: "NOT_FOUND", message: "User not found" };
      }

      await prisma.user.update({
         where: { id: userId },
         data: { name },
      });
      revalidatePath(profilePage);
      return { ok: true, data: { message: "Profile updated successfully" } };
   } catch (error) {
      if (
         error instanceof PrismaClientKnownRequestError &&
         error.code === "P2002"
      ) {
         return {
            ok: false,
            error: "CONFLICT",
            message: "ID number is already in use",
         };
      }
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to update profile",
      };
   }
}
