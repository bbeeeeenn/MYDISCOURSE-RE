import { roomsPage } from "@/constants";
import getRoom from "@/data-access-layer/room/room";
import { ArrowLeft, MapPin, UsersRound } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import AdminControls from "./_components/adminControls";
import Link from "next/link";
import { Suspense } from "react";
import DatePicker from "./_components/datePicker";
import CreateReservation from "./_components/createReservation";

export default async function RoomPage({
   params,
   searchParams,
}: {
   params: Promise<{ room: string }>;
   searchParams: Promise<{ date?: string }>;
}) {
   return (
      <Suspense>
         <Suspended params={params} searchParams={searchParams} />
      </Suspense>
   );
}

async function Suspended({
   params,
   searchParams,
}: {
   params: Promise<{ room: string }>;
   searchParams: Promise<{ date?: string }>;
}) {
   const { date } = await searchParams;
   const { room: roomId } = await params;
   const room = await getRoom(roomId);
   if (!room) redirect(roomsPage);

   return (
      <>
         {/* Header */}
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
            <AdminControls room={room} />
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

         <DatePicker dateParam={date} />
         <div className="mt-5 p-3">
            <CreateReservation room={room} dateParam={date} />
         </div>
      </>
   );
}
