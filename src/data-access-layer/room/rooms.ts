import { RoomSelect } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";

export default async function getRooms(select?: RoomSelect) {
   return await prisma.room.findMany({ orderBy: { createdAt: "asc" }, select });
}
