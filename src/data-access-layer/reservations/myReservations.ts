import { roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const reservationSelect = {
   room: { select: { room_name: true, location: true, capacity: true } },
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
   const [ongoing, upcoming, upcomingTotal] =
      await Promise.all([
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
