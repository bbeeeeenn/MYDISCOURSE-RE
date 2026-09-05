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
   const today = parseISO(getPhilippineToday());
   const fallbackDate = today.getDay() === 0 ? addDays(today, 1) : today;
   const requestedDate = date ? parseISO(date) : fallbackDate;
   const normalizedDate =
      isValid(requestedDate) && requestedDate.getDay() !== 0
         ? requestedDate
         : fallbackDate;
   const selectedDate = format(normalizedDate, "yyyy-MM-dd");
   const reservations = await getRoomReservations(room.id, selectedDate);

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
                              {reservation.occupants === 1
                                 ? "person"
                                 : "people"}
                           </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                           Reserved by{" "}
                           {reservation.user.name?.trim() || "Unnamed user"}
                        </p>
                        <p className="mt-2 text-gray-800">
                           {reservation.purpose}
                        </p>
                     </article>
                  ))}
               </div>
            )}
         </section>
      </>
   );
}
