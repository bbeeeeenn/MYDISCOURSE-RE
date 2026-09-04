"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export default async function deleteRoom(
   id: string,
): ActionResult<{ message: string }> {
   // Checking the session
   const session = await auth();
   if (session?.user.role !== "ADMIN")
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   // Validating the id
   const roomId = id.trim();
   if (!roomId) {
      return { ok: false, error: "VALIDATION", message: "Room ID is required" };
   }

   try {
      // Commencing delete
      await prisma.room.delete({ where: { id: roomId } });

      return { ok: true, data: { message: "Room deleted successfully" } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
         return { ok: false, error: "NOT_FOUND", message: "Room not found" };
      }

      console.error(e);
      return { ok: false, error: "DATABASE", message: "Unable to delete room" };
   }
}
