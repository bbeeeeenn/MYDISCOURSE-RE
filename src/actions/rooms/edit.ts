"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export default async function editRoom(
   id: string,
   rawData: {
      name: string;
      capacity: number;
      imageUrl?: string;
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
      // Commencing update
      await prisma.room.update({
         where: { id: roomId },
         data: { room_name: name, image_url: imageUrl, capacity, location },
      });

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
               message: "Room already exists",
            };
         }
      }

      console.error(e);
      return { ok: false, error: "DATABASE", message: "Unable to update room" };
   }
}
