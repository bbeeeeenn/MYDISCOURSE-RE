import { roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { parsePhilippineDate } from "@/lib/date";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { addDays } from "date-fns";

const reservationSelect = {
   room: {
      select: { id: true, room_name: true, location: true, capacity: true },
   },
};

export async function getMyReservations({
   upcomingPage,
   pageSize,
}: {
   upcomingPage: number;
   pageSize: number;
}) {
   const session = await auth();
   if (!session?.user) redirect(roomsPage);

   const now = new Date();
   const userId = session.user.id;
   const [ongoing, upcoming, upcomingTotal] = await Promise.all([
      prisma.reservation.findMany({
         where: {
            userId,
            startTime: { lte: now },
            endTime: { gt: now },
         },
         include: reservationSelect,
         orderBy: { startTime: "asc" },
      }),
      prisma.reservation.findMany({
         where: { userId, startTime: { gt: now } },
         include: reservationSelect,
         orderBy: { startTime: "asc" },
         skip: (upcomingPage - 1) * pageSize,
         take: pageSize,
      }),
      prisma.reservation.count({
         where: { userId, startTime: { gt: now } },
      }),
   ]);

   return { ongoing, upcoming, upcomingTotal };
}

export async function getPastReservations({
   page,
   pageSize,
   roomId,
   date,
}: {
   page: number;
   pageSize: number;
   roomId?: string;
   date?: string;
}) {
   const session = await auth();
   if (!session?.user) redirect(roomsPage);

   const where = {
      userId: session.user.id,
      endTime: { lte: new Date() },
      ...(roomId ? { roomId } : {}),
      ...(date
         ? {
              startTime: {
                 gte: parsePhilippineDate(date),
                 lt: addDays(parsePhilippineDate(date), 1),
              },
           }
         : {}),
   };
   const [past, pastTotal] = await Promise.all([
      prisma.reservation.findMany({
         where,
         include: reservationSelect,
         orderBy: { endTime: "desc" },
         skip: (page - 1) * pageSize,
         take: pageSize,
      }),
      prisma.reservation.count({ where }),
   ]);

   return { past, pastTotal };
}
