"use server";

import { auth } from "@/lib/auth";
import { parsePhilippineDateTime } from "@/lib/date";
import prisma from "@/lib/prisma";
import { addMinutes } from "date-fns";

export default async function createReservation(
   roomId: string,
   scheduledDate: string,
   startTime: string,
   endTime: string,
   purpose: string,
   occupants: string[],
): ActionResult<{ message: string }> {
   const session = await auth();
   const userId = session?.user.id;
   if (!userId) return { ok: false, error: "AUTH", message: "Please sign in" };

   try {
      if (
         !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) ||
         !startTime ||
         !endTime
      ) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Date and times are required",
         };
      }
      const scheduledDay = parsePhilippineDateTime(scheduledDate, "12:00");
      if (
         Number.isNaN(scheduledDay.getTime()) ||
         scheduledDay.getUTCDay() === 0
      ) {
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
      if (
         (occupants.length === 0 && session.user.role !== "ADMIN") ||
         !purpose
      ) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Complete all reservation fields",
         };
      }

      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room)
         return { ok: false, error: "NOT_FOUND", message: "Room not found" };
      if (occupants.length > room.capacity) {
         return {
            ok: false,
            error: "VALIDATION",
            message: `Occupants cannot exceed ${room.capacity}`,
         };
      }

      const newSchedStartTime = parsePhilippineDateTime(
         scheduledDate,
         startTime,
      );
      const newSchedEndTime = parsePhilippineDateTime(scheduledDate, endTime);
      const now = new Date();
      if (newSchedEndTime <= now || addMinutes(newSchedStartTime, 10) <= now) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "The reservation time window has already passed",
         };
      }
      if (
         (newSchedEndTime.getTime() - newSchedStartTime.getTime()) /
            1000 /
            60 /
            60 >
         2
      ) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Reservation duration cannot exceed 2 hours",
         };
      }

      // Checks for overlap
      const overlap = await prisma.reservation.findFirst({
         where: {
            roomId,
            startTime: { lt: newSchedEndTime },
            OR: [
               {
                  checkedOutAt: null,
                  endTime: { gt: newSchedStartTime },
               },
               {
                  checkedOutAt: { gt: newSchedStartTime },
               },
            ],
         },
      });
      if (overlap) {
         return {
            ok: false,
            error: "CONFLICT",
            message: "There is an overlap with an existing reservation",
         };
      }

      await prisma.reservation.create({
         data: {
            roomId,
            userId,
            startTime: newSchedStartTime,
            endTime: newSchedEndTime,
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
