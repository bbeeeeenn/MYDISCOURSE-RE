"use server";

import { roomsPage } from "@/constants";
import { updateRoomCache } from "@/data-access-layer/room/room";
import { auth } from "@/lib/auth";
import deleteImage from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function editRoom(
   id: string,
   rawData: {
      name: string;
      capacity: number;
      imageUrl?: string;
      imagePublicId?: string;
      location: string;
   },
): ActionResult<{ message: string }> {
   // Checking the session and role
   const session = await auth();
   if (session?.user.role !== "ADMIN")
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   // Normalizing variables
   const roomId = id.trim();
   const name = rawData.name.trim();
   const location = rawData.location.trim();
   const imageUrl = rawData.imageUrl?.trim() || null;
   const imagePublicId = rawData.imagePublicId?.trim() || null;
   const { capacity } = rawData;

   // Validating
   if (!roomId) {
      return { ok: false, error: "VALIDATION", message: "Room ID is required" };
   }

   if (!name) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Room name is required",
      };
   }

   if (
      capacity !== undefined &&
      (!Number.isInteger(capacity) || capacity < 1)
   ) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Capacity must be a positive whole number",
      };
   }

   try {
      // Deleting the cloudinary image first (bahala na mo fail sa)
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (
         room &&
         room.image_public_id &&
         room.image_public_id !== imagePublicId
      ) {
         await deleteImage(room.image_public_id);
      }

      // Commencing update
      await prisma.room.update({
         where: { id: roomId },
         data: {
            room_name: name,
            image_url: imageUrl,
            image_public_id: imagePublicId,
            capacity,
            location,
         },
      });

      updateRoomCache(roomId);
      revalidatePath(roomsPage);

      return { ok: true, data: { message: "Room updated successfully" } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
         if (e.code === "P2025") {
            return { ok: false, error: "NOT_FOUND", message: "Room not found" };
         }

         if (e.code === "P2002") {
            return {
               ok: false,
               error: "CONFLICT",
               message: "Such room name already exists",
            };
         }
      }

      console.error(e);
      return { ok: false, error: "DATABASE", message: "Unable to update room" };
   }
}
