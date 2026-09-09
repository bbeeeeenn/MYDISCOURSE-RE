import { roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import { parsePhilippineDate } from "@/lib/date";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { addDays } from "date-fns";

export async function getAllReservations({
   upcomingPage,
   pageSize,
   roomId,
   date,
}: {
   upcomingPage: number;
   pageSize: number;
   roomId?: string;
   date?: string;
}) {
   await restrictReservationAccess();

   const now = new Date();
   const filters = getReservationFilters(roomId, date);
   const where = { endTime: { gt: now }, ...filters };
   const [upcoming, upcomingTotal] = await Promise.all([
      prisma.reservation.findMany({
         where,
         include: reservationInclude,
         orderBy: { startTime: "asc" },
         skip: (upcomingPage - 1) * pageSize,
         take: pageSize,
      }),
      prisma.reservation.count({ where }),
   ]);

   return { upcoming, upcomingTotal };
}

export async function getCompletedReservations({
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
   await restrictReservationAccess();

   const where = {
      endTime: { lte: new Date() },
      ...getReservationFilters(roomId, date),
   };
   const [completed, completedTotal] = await Promise.all([
      prisma.reservation.findMany({
         where,
         include: reservationInclude,
         orderBy: { endTime: "desc" },
         skip: (page - 1) * pageSize,
         take: pageSize,
      }),
      prisma.reservation.count({ where }),
   ]);

   return { completed, completedTotal };
}

function getReservationFilters(roomId?: string, date?: string) {
   const filters: {
      roomId?: string;
      startTime?: { gte: Date; lt: Date };
   } = {};

   if (roomId) filters.roomId = roomId;

   if (date) {
      const start = parsePhilippineDate(date);
      if (!Number.isNaN(start.getTime())) {
         filters.startTime = { gte: start, lt: addDays(start, 1) };
      }
   }

   return filters;
}

const reservationInclude = {
   room: {
      select: { id: true, room_name: true, location: true },
   },
   user: {
      select: { name: true, email: true },
   },
} as const;

async function restrictReservationAccess() {
   const session = await auth();
   if (!session?.user) redirect(roomsPage);
   if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      redirect(roomsPage);
   }
}
