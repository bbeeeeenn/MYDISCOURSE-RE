"use server";

import { roomsPage } from "@/constants";
import { updateRoomCache } from "@/data-access-layer/room/room";
import { auth } from "@/lib/auth";
import deleteImage from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

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
      // Deleting the cloudinary image first (bahala na mo fail sa)
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (room && room.image_public_id) {
         await deleteImage(room.image_public_id);
      }
      // Commencing delete
      await prisma.room.delete({ where: { id: roomId } });

      updateRoomCache(roomId);
      revalidatePath(roomsPage);

      return { ok: true, data: { message: "Room deleted successfully" } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
         return { ok: false, error: "NOT_FOUND", message: "Room not found" };
      }

      console.error(e);
      return { ok: false, error: "DATABASE", message: "Unable to delete room" };
   }
}
