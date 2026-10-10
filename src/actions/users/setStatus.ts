"use server";

import { usersPage } from "@/constants";
import { Role } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function setUserStatus(
   id: string,
   status: "ACTIVE" | "DISABLED",
): ActionResult<{ message: string }> {
   const session = await auth();
   if (session?.user.role !== Role.ADMIN) {
      return { ok: false, error: "FORBIDDEN", message: "Unauthorized" };
   }

   const userId = id.trim();
   if (!userId) {
      return { ok: false, error: "VALIDATION", message: "User ID is required" };
   }
   if (status !== "ACTIVE" && status !== "DISABLED") {
      return { ok: false, error: "VALIDATION", message: "Invalid account status" };
   }
   if (userId === session.user.id && status === "DISABLED") {
      return {
         ok: false,
         error: "FORBIDDEN",
         message: "You cannot disable your own account",
      };
   }

   try {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         select: { id: true, role: true, disabledAt: true },
      });
      if (!user) {
         return { ok: false, error: "NOT_FOUND", message: "User not found" };
      }

      if (
         status === "DISABLED" &&
         user.role === Role.ADMIN &&
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
         data: { disabledAt: status === "DISABLED" ? new Date() : null },
      });

      revalidatePath(usersPage);
      return {
         ok: true,
         data: {
            message:
               status === "DISABLED"
                  ? "Account disabled successfully"
                  : "Account restored successfully",
         },
      };
   } catch (error) {
      if (
         error instanceof PrismaClientKnownRequestError &&
         error.code === "P2025"
      ) {
         return { ok: false, error: "NOT_FOUND", message: "User not found" };
      }

      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to update account status",
      };
   }
}
