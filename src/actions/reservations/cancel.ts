"use server";

import { myReservationsPage } from "@/constants";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function cancelReservation(
   reservationId: string,
): ActionResult<{ message: string }> {
   const session = await auth();
   const userId = session?.user.id;
   if (!userId) return { ok: false, error: "AUTH", message: "Please sign in" };

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
         select: { userId: true, startTime: true },
      });

      // Making sure they own the reservation
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
            message: "Started or completed reservations cannot be cancelled",
         };
      }

      await prisma.reservation.delete({ where: { id } });
      revalidatePath(myReservationsPage);

      return { ok: true, data: { message: "Reservation cancelled" } };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "DATABASE",
         message: "Unable to cancel reservation",
      };
   }
}
