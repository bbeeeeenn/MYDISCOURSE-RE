import prisma from "@/lib/prisma";
import { parsePhilippineDate } from "@/lib/date";
import { addDays, isValid } from "date-fns";

export default async function getRoomReservations(
   roomId: string,
   date: string,
) {
   const dayStart = parsePhilippineDate(date);
   if (!isValid(dayStart)) return [];

   const dayEnd = addDays(dayStart, 1);
   return prisma.reservation.findMany({
      where: {
         roomId,
         startTime: { gte: dayStart, lt: dayEnd },
         endTime: { gt: new Date() },
      },
      include: {
         user: { select: { name: true, role: true } },
      },
      orderBy: { startTime: "asc" },
   });
}

export async function getOngoingRoomReservations(roomId: string) {
   const now = new Date();
   return prisma.reservation.findMany({
      where: {
         roomId,
         startTime: { lte: now },
         endTime: { gt: now },
      },
      include: {
         user: { select: { name: true, role: true } },
      },
      orderBy: { startTime: "asc" },
   });
}
