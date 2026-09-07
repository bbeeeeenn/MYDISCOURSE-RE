"use server";

import { myReservationsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { parsePhilippineDateTime } from "@/lib/date";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function editReservation(
   reservationId: string,
   formData: FormData,
): ActionResult<{ message: string }> {
   const session = await auth();
   const userId = session?.user.id;
   if (!userId) return { ok: false, error: "AUTH", message: "Please sign in" };

   const id = reservationId.trim();
   const scheduledDate = String(formData.get("scheduledDate") || "");
   const startTime = String(formData.get("startTime") || "");
   const endTime = String(formData.get("endTime") || "");
   const purpose = String(formData.get("purpose") || "").trim();
   const occupants = Number(formData.get("occupants"));

   if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return { ok: false, error: "VALIDATION", message: "Date is required" };
   }
   if (!startTime || !endTime || startTime >= endTime) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Choose a valid start and end time",
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
   if (!Number.isInteger(occupants) || occupants < 1 || !purpose) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Complete all reservation fields",
      };
   }

   try {
      const reservation = await prisma.reservation.findUnique({
         where: { id },
         include: { room: { select: { capacity: true } } },
      });
      if (!reservation || reservation.userId !== userId) {
         return {
            ok: false,
            error: "NOT_FOUND",
            message: "Reservation not found",
         };
      }
      if (reservation.startTime <= new Date()) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Only upcoming reservations can be edited",
         };
      }
      if (occupants > reservation.room.capacity) {
         return {
            ok: false,
            error: "VALIDATION",
            message: `Occupants cannot exceed ${reservation.room.capacity}`,
         };
      }

      const start = parsePhilippineDateTime(scheduledDate, startTime);
      const end = parsePhilippineDateTime(scheduledDate, endTime);
      if (start <= new Date()) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "Reservation must start in the future",
         };
      }

      const overlap = await prisma.reservation.findFirst({
         where: {
            roomId: reservation.roomId,
            id: { not: id },
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

      await prisma.reservation.update({
         where: { id },
         data: { startTime: start, endTime: end, occupants, purpose },
      });
      revalidatePath(myReservationsPage);

      return {
         ok: true,
         data: { message: "Reservation updated successfully" },
      };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to update reservation",
      };
   }
}
