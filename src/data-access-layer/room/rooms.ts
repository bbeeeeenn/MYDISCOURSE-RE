import prisma from "@/lib/prisma";

export default async function getRooms() {
   return await prisma.room.findMany({ orderBy: { createdAt: "asc" } });
}
