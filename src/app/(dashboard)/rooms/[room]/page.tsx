import { roomsPage } from "@/constants";
import getRoom from "@/data-access-layer/room/room";
import { ArrowLeft, MapPin, UsersRound } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import EditRoomButton from "./_components/editButton";
import Link from "next/link";

export const instant = false;
export default async function RoomPage({
   params,
}: {
   params: Promise<{ room: string }>;
}) {
   const { room: roomId } = await params;
   const room = await getRoom(roomId);
   if (!room) redirect(roomsPage);

   return (
      <>
         <div className="relative z-0 min-h-60 bg-gray-800 shadow-md">
            {room.image_url && (
               <Image
                  src={room.image_url}
                  alt=""
                  width={1000}
                  height={1000}
                  loading="lazy"
                  className="absolute inset-0 -z-10 size-full object-cover brightness-50"
               />
            )}
            <EditRoomButton roomId={room.id} />
            <Link
               href={roomsPage}
               className="text-base-100 absolute top-3 left-3 z-100"
            >
               <ArrowLeft />
            </Link>
            <div className="text-base-100 absolute inset-0 z-10 flex flex-col justify-end p-4">
               <p className="text-xl font-bold sm:text-2xl">{room.room_name}</p>
               <p className="flex items-center gap-1">
                  <MapPin size={15} />
                  {room.location}
               </p>
               <p className="flex items-center gap-1">
                  <UsersRound size={15} />
                  {room.capacity}
               </p>
            </div>
         </div>
      </>
   );
}
