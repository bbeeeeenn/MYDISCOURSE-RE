"use server";

import { reservationsPage, roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function adminDeleteReservation(
   reservationId: string,
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
      await prisma.reservation.delete({ where: { id } });
      revalidatePath(reservationsPage);
      revalidatePath(roomsPage);
      return { ok: true, data: { message: "Reservation deleted" } };
   } catch (error) {
      console.error(error);
      return {
         ok: false,
         error: "NOT_FOUND",
         message: "Reservation not found",
      };
   }
}
