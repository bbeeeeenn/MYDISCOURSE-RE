import { roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const reservationSelect = {
   room: { select: { room_name: true, location: true, capacity: true } },
};

export async function getPastReservations({
   page,
   pageSize,
}: {
   page: number;
   pageSize: number;
}) {
   const session = await auth();
   if (!session?.user) redirect(roomsPage);

   const where = {
      userId: session.user.id,
      endTime: { lte: new Date() },
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