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
import getRoomReservations from "@/data-access-layer/room/reservations";
import { addDays, format, isValid, parseISO } from "date-fns";
import { formatPhilippineTime, getPhilippineToday } from "@/lib/date";
import { RoomModel } from "@/generated/prisma/models";

export default async function RoomPage({
   params,
   searchParams,
}: {
   params: Promise<{ room: string }>;
   searchParams: Promise<{ date?: string }>;
}) {
   return (
      <Suspense fallback={<RoomPageFallback />}>
         <Suspended params={params} searchParams={searchParams} />
      </Suspense>
   );
}

function RoomPageFallback() {
   return (
      <div className="animate-pulse" aria-busy="true">
         <div className="relative min-h-60 bg-gray-200">
            <div className="absolute inset-x-4 bottom-4 grid gap-2">
               <div className="h-7 w-48 rounded bg-gray-300" />
               <div className="h-4 w-32 rounded bg-gray-300" />
               <div className="h-4 w-20 rounded bg-gray-300" />
            </div>
         </div>
         <div className="flex gap-2 overflow-hidden p-4">
            {["one", "two", "three", "four", "five"].map((item) => (
               <div
                  key={item}
                  className="h-24 min-w-20 rounded-lg bg-gray-200"
               />
            ))}
         </div>
         <div className="mt-5 px-3">
            <div className="h-10 w-48 rounded-md bg-gray-200" />
         </div>
         <ReservationsFallback />
      </div>
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

   const today = parseISO(getPhilippineToday());
   const fallbackDate = today.getDay() === 0 ? addDays(today, 1) : today;
   const requestedDate = date ? parseISO(date) : fallbackDate;
   const normalizedDate =
      isValid(requestedDate) && requestedDate.getDay() !== 0
         ? requestedDate
         : fallbackDate;
   const selectedDate = format(normalizedDate, "yyyy-MM-dd");

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

         <DatePicker dateParam={selectedDate} />
         <div className="mt-5 p-3">
            <CreateReservation room={room} dateParam={selectedDate} />
         </div>

         <Suspense fallback={<ReservationsFallback />}>
            <Reservations room={room} selectedDate={selectedDate} />
         </Suspense>
      </>
   );
}

function ReservationsFallback() {
   return (
      <section className="animate-pulse p-3 pb-25" aria-busy="true">
         <div className="mb-3 flex items-baseline justify-between gap-3">
            <div className="h-6 w-32 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
         </div>
         <div className="grid gap-3">
            {["first", "second"].map((item) => (
               <div
                  key={item}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
               >
                  <div className="flex items-center justify-between gap-3">
                     <div className="h-5 w-36 rounded bg-gray-200" />
                     <div className="h-4 w-16 rounded bg-gray-200" />
                  </div>
                  <div className="mt-3 h-4 w-40 rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
               </div>
            ))}
         </div>
      </section>
   );
}

async function Reservations({
   selectedDate,
   room,
}: {
   selectedDate: string;
   room: RoomModel;
}) {
   const reservations = await getRoomReservations(room.id, selectedDate);

   return (
      <section className="p-3 pb-25">
         <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-semibold">Reservations</h2>
            <p className="text-sm text-gray-500">
               {format(parseISO(selectedDate), "EEE, MMM d")}
            </p>
         </div>
         {reservations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
               No reservations for this day.
            </p>
         ) : (
            <div className="grid gap-3">
               {reservations.map((reservation) => (
                  <article
                     key={reservation.id}
                     className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                     <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">
                           {formatPhilippineTime(reservation.startTime)} -{" "}
                           {formatPhilippineTime(reservation.endTime)}
                        </p>
                        <p className="text-sm text-gray-600">
                           {reservation.occupants}{" "}
                           {reservation.occupants === 1 ? "person" : "people"}
                        </p>
                     </div>
                     <p className="mt-2 text-sm text-gray-600">
                        Reserved by{" "}
                        {reservation.user.name?.trim() || "Unnamed user"}
                     </p>
                     <p className="mt-2 text-gray-800">{reservation.purpose}</p>
                  </article>
               ))}
            </div>
         )}
      </section>
   );
}
