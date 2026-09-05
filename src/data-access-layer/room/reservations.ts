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
      },
      include: {
         user: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
   });
}
