"use server";

import { usersPage } from "@/constants";
import { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function updateUser(
   id: string,
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   if (session?.user.role !== "ADMIN") {
      return { ok: false, error: "FORBIDDEN", message: "Unauthorized" };
   }

   const userId = id.trim();
   const name = String(formData.get("name") ?? "").trim();
   const email = String(formData.get("email") ?? "").trim().toLowerCase();
   const roleValue = String(formData.get("role") ?? "");

   if (!userId) {
      return { ok: false, error: "VALIDATION", message: "User ID is required" };
   }
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
   if (!Object.values(Role).includes(roleValue as Role)) {
      return { ok: false, error: "VALIDATION", message: "A valid role is required" };
   }

   try {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         select: { id: true, role: true, disabledAt: true },
      });
      if (!user) {
         return { ok: false, error: "NOT_FOUND", message: "User not found" };
      }

      if (user.id === session.user.id && roleValue !== Role.ADMIN) {
         return {
            ok: false,
            error: "FORBIDDEN",
            message: "You cannot remove your own admin access",
         };
      }

      if (
         user.role === Role.ADMIN &&
         roleValue !== Role.ADMIN &&
         !user.disabledAt
      ) {
         const activeAdminCount = await prisma.user.count({
            where: {
               role: Role.ADMIN,
               disabledAt: null,
               id: { not: userId },
            },
         });
         if (activeAdminCount === 0) {
            return {
               ok: false,
               error: "FORBIDDEN",
               message: "At least one active admin is required",
            };
         }
      }

      await prisma.user.update({
         where: { id: userId },
         data: {
            name,
            email,
            role: roleValue as Role,
         },
      });

      revalidatePath(usersPage);
      return { ok: true, data: { message: "Account updated successfully" } };
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
         message: "Unable to update account",
      };
   }
}
