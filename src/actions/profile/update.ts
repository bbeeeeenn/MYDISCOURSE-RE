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
   const idNumber = String(formData.get("idNumber") || "").trim() || null;
   const course = String(formData.get("course") || "").trim() || null;
   const yearLevelValue = String(formData.get("yearLevel") || "");
   const yearLevel = yearLevelValue ? Number(yearLevelValue) : null;

   if (!name) {
      return { ok: false, error: "VALIDATION", message: "Name is required" };
   }
   if (yearLevel !== null && (!Number.isInteger(yearLevel) || yearLevel < 1)) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Year level must be a positive whole number",
      };
   }

   try {
      await prisma.user.update({
         where: { id: userId },
         data: { name, id_number: idNumber, year_level: yearLevel, course },
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
