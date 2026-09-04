"use server";

import { roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { revalidatePath } from "next/cache";

export default async function createRoom(rawData: {
   name: string;
   capacity: number;
   imageUrl?: string;
   location: string;
}): ActionResult<{ message: string }> {
   // Checking the session
   const session = await auth();
   if (session?.user.role !== "ADMIN")
      return { ok: false, error: "AUTH", message: "Unauthorized" };

   // Sanitizing
   const name = rawData.name.trim();
   const location = rawData.location.trim();
   const imageUrl = rawData.imageUrl?.trim() || undefined;
   const { capacity } = rawData;

   // Validating
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
      // Commencing create
      await prisma.room.create({
         data: { room_name: name, image_url: imageUrl, capacity, location },
      });

      revalidatePath(roomsPage)

      return { ok: true, data: { message: "Room created successfully" } };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
         return {
            ok: false,
            error: "CONFLICT",
            message: "Such room name already exists",
         };
      }

      console.error(e);
      return { ok: false, error: "DATABASE", message: "Unable to create room" };
   }
}
