import prisma from "@/lib/prisma";
import { cacheLife, cacheTag, updateTag } from "next/cache";

export default async function getRoom(roomId: string) {
   "use cache";
   cacheLife("days");
   cacheTag(`room:${roomId}`);

   return await prisma.room.findUnique({ where: { id: roomId } });
}

export function clearRoomCache(roomId: string) {
   updateTag(`room:${roomId}`);
}
