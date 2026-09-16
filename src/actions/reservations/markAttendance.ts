"use server";

import { reservationsPage, roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function markReservationAttendance(
   reservationId: string,
   action: "CHECK_IN" | "CHECK_OUT",
): ActionResult<{ message: string }> {
   const session = await auth();
   if (
      !session?.user ||
      (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
   ) {
      return { ok: false, error: "AUTH", message: "Not authorized" };
   }

   const id = reservationId.trim();
   if (!id) {
      return {
         ok: false,
         error: "VALIDATION",
         message: "Reservation ID is required",
      };
   }

   try {
      const reservation = await prisma.reservation.findUnique({
         where: { id },
      });

      if (!reservation) {
         return {
            ok: false,
            error: "NOT_FOUND",
            message: "Reservation not found",
         };
      }

      const now = new Date();

      if (action === "CHECK_IN") {
         if (reservation.checkedInAt) {
            return {
               ok: false,
               error: "VALIDATION",
               message: "This reservation has already been timed in",
            };
         }

         if (!(reservation.startTime <= now && now < reservation.endTime)) {
            return {
               ok: false,
               error: "VALIDATION",
               message: "The reservation is not ready for time-in yet",
            };
         }

         await prisma.reservation.update({
            where: { id },
            data: { checkedInAt: now },
         });

         revalidatePath(reservationsPage);
         revalidatePath(roomsPage);
         revalidatePath(`/reservations/${id}`);

         return {
            ok: true,
            data: { message: "Reservation timed in successfully" },
         };
      }

      if (!reservation.checkedInAt) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "This reservation must be timed in before timing out",
         };
      }

      if (reservation.checkedOutAt) {
         return {
            ok: false,
            error: "VALIDATION",
            message: "This reservation has already been timed out",
         };
      }

      await prisma.reservation.update({
         where: { id },
         data: { checkedOutAt: now },
      });

      revalidatePath(reservationsPage);
      revalidatePath(roomsPage);
      revalidatePath(`${reservationsPage}/${id}`);

      return {
         ok: true,
         data: { message: "Reservation timed out successfully" },
      };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to update reservation attendance",
      };
   }
}
