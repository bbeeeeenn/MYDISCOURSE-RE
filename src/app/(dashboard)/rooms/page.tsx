import { roomsPage } from "@/constants";
import { MapPin, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import CreateButton from "./_components/CreateButton";
import getRooms from "@/data-access-layer/rooms";

async function Suspended() {
   const rooms = await getRooms();

   return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         {rooms.map((room) => (
            <Link
               key={room.id}
               href={roomsPage + `/${room.room_name}`}
               className="flex h-45 overflow-hidden rounded-md border border-gray-400 bg-[#d9d9d9] shadow-md"
            >
               {room.image_url && (
                  <div className="w-[30%]">
                     <Image
                        src={room.image_url}
                        alt=""
                        width={300}
                        height={300}
                        className="size-full object-cover"
                     />
                  </div>
               )}
               <div className="space-y-1 px-3 py-2">
                  <p className="text-base-300 text-lg font-semibold">
                     {room.room_name}
                  </p>
                  <p className="flex items-center gap-1 text-sm">
                     <span>
                        <MapPin size={17} />
                     </span>
                     {room.location}
                  </p>
                  <p className="flex items-center gap-1 text-sm">
                     <span>
                        <UsersRound size={17} />
                     </span>
                     Capacity - {room.capacity}
                  </p>
               </div>
            </Link>
         ))}
      </div>
   );
}

export default function RoomsPage() {
   return (
      <div className="p-4">
         <Suspense>
            <CreateButton />
         </Suspense>
         <Suspense>
            <Suspended />
         </Suspense>
      </div>
   );
}
