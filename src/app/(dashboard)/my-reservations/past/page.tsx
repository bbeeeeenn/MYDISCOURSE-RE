import {
   myReservationsPage,
   pastReservationsPage,
   reservationsPageSize,
} from "@/constants";
import { getPastReservations } from "@/data-access-layer/reservations/myReservations";
import getRooms from "@/data-access-layer/room/rooms";
import ReservationFilters, {
   formatFilterDate,
} from "../../reservations/_components/ReservationFilters";
import { CalendarDays, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Pagination from "../_components/Pagination";
import ReservationCard from "../_components/ReservationCard";

function parsePage(value: string | undefined) {
   const page = Number.parseInt(value ?? "1", 10);
   return Number.isInteger(page) && page > 0 ? page : 1;
}

async function Suspended({
   searchParams,
}: {
   searchParams: Promise<{
      pastPage?: string;
      roomId?: string;
      date?: string;
   }>;
}) {
   const params = await searchParams;
   const page = parsePage(params.pastPage);
   const roomId = params.roomId || undefined;
   const date = formatFilterDate(params.date);
   const [{ past, pastTotal }, rooms] = await Promise.all([
      getPastReservations({
         page,
         pageSize: reservationsPageSize,
         roomId,
         date,
      }),
      getRooms(),
   ]);

   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <header className="mx-auto max-w-5xl">
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
               <div>
                  <Link
                     href={myReservationsPage}
                     className="text-base-300 flex items-center gap-1 text-sm font-semibold hover:brightness-125"
                  >
                     <span>
                        <ChevronLeft size={15} />
                     </span>
                     Back to my reservations
                  </Link>
                  <h1 className="text-base-400 mt-2 text-3xl font-bold">
                     Past Reservations
                  </h1>
               </div>
               <Link
                  href="/rooms"
                  className="bg-base-300 text-base-100 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-110"
               >
                  Browse rooms
               </Link>
            </div>
         </header>

         <main className="mx-auto mt-8 max-w-5xl">
            <ReservationFilters
               rooms={rooms}
               pathname={pastReservationsPage}
               roomId={roomId}
               date={date}
            />
            <div className="mb-3 flex items-center justify-between">
               <h2 className="text-xl font-semibold">Completed bookings</h2>
               <span className="text-sm text-gray-500">
                  {pastTotal} bookings
               </span>
            </div>
            {past.length ? (
               <>
                  <div className="grid gap-4 opacity-90">
                     {past.map((reservation) => (
                        <ReservationCard
                           key={reservation.id}
                           reservation={reservation}
                           status="past"
                        />
                     ))}
                  </div>
                  <Pagination
                     page={page}
                     total={pastTotal}
                     param="pastPage"
                     pageSize={reservationsPageSize}
                     query={{ roomId, date }}
                  />
               </>
            ) : (
               <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                  <CalendarDays className="mx-auto text-gray-400" size={28} />
                  <p className="mt-3 font-medium">No past reservations</p>
                  <p className="mt-1 text-sm text-gray-500">
                     Completed reservations will appear here.
                  </p>
               </div>
            )}
         </main>
      </div>
   );
}

function ReservationsFallback() {
   return (
      <div
         className="min-h-[calc(100vh-3.5rem)] animate-pulse bg-gray-50 p-4 pb-12 sm:p-8"
         aria-busy="true"
      >
         <header className="mx-auto flex max-w-5xl items-end justify-between gap-3">
            <div>
               <div className="h-4 w-36 rounded bg-gray-200" />
               <div className="mt-3 h-9 w-56 rounded bg-gray-200" />
            </div>
            <div className="h-10 w-32 rounded-md bg-gray-200" />
         </header>
         <main className="mx-auto mt-8 max-w-5xl">
            <div className="mb-3 flex items-center justify-between">
               <div className="h-7 w-40 rounded bg-gray-200" />
               <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
            <div className="grid gap-4">
               <div className="h-40 rounded-lg bg-gray-200" />
               <div className="h-40 rounded-lg bg-gray-200" />
            </div>
         </main>
      </div>
   );
}

export default async function PastReservationsPage({
   searchParams,
}: {
   searchParams: Promise<{
      pastPage?: string;
      roomId?: string;
      date?: string;
   }>;
}) {
   return (
      <Suspense fallback={<ReservationsFallback />}>
         <Suspended searchParams={searchParams} />
      </Suspense>
   );
}
