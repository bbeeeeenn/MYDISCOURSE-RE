import prisma from "@/lib/prisma";
import { cacheLife } from "next/cache";

export default async function getRooms() {
   "use cache";
   cacheLife("days");

   return await prisma.room.findMany();
}
