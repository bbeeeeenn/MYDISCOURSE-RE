"use server";

import { auth } from "@/lib/auth";
import { parsePhilippineDateTime } from "@/lib/date";
import prisma from "@/lib/prisma";

export default async function createReservation(
   roomId: string,
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   const userId = session?.user.id;
   if (!userId) return { ok: false, error: "AUTH", message: "Please sign in" };

   const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, id_number: true, year_level: true, course: true },
   });
   if (
      !user ||
      !user.name?.trim() ||
      !user.id_number?.trim() ||
      !user.course?.trim() ||
      user.year_level === null
   ) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Complete your profile before creating a reservation",
      };
   }

   const scheduledDate = String(formData.get("scheduledDate") || "");
   const startTime = String(formData.get("startTime") || "");
   const endTime = String(formData.get("endTime") || "");
   const purpose = String(formData.get("purpose") || "").trim();
   const occupants = Number(formData.get("occupants"));

   if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !startTime || !endTime) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Date and times are required",
      };
   }
   const scheduledDay = parsePhilippineDateTime(scheduledDate, "12:00");
   if (Number.isNaN(scheduledDay.getTime()) || scheduledDay.getUTCDay() === 0) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Reservations are available Monday through Saturday",
      };
   }
   if (startTime < "08:00" || endTime > "18:00") {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Reservations are available from 8:00 AM to 6:00 PM",
      };
   }
   if (startTime >= endTime) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "End time must be later than start time",
      };
   }
   if (!Number.isInteger(occupants) || occupants < 1 || !purpose) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Complete all reservation fields",
      };
   }

   const room = await prisma.room.findUnique({ where: { id: roomId } });
   if (!room)
      return { ok: false, error: "NOT_FOUND", message: "Room not found" };
   if (occupants > room.capacity) {
      return {
         ok: false,
         error: "VALIDATION",
         message: `Occupants cannot exceed ${room.capacity}`,
      };
   }

   const start = parsePhilippineDateTime(scheduledDate, startTime);
   const end = parsePhilippineDateTime(scheduledDate, endTime);
   const overlap = await prisma.reservation.findFirst({
      where: {
         roomId,
         startTime: { lt: end },
         endTime: { gt: start },
      },
   });
   if (overlap) {
      return {
         ok: false,
         error: "CONFLICT",
         message: "There is an overlap with an existing reservation",
      };
   }

   try {
      await prisma.reservation.create({
         data: {
            roomId,
            userId,
            startTime: start,
            endTime: end,
            occupants,
            purpose,
         },
      });

      return {
         ok: true,
         data: { message: "Reservation created successfully" },
      };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to create reservation",
      };
   }
}
