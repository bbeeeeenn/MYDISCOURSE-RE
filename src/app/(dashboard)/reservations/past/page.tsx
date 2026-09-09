import { reservationsPage, reservationsPageSize, roomsPage } from "@/constants";
import { getCompletedReservations } from "@/data-access-layer/reservations/allReservations";
import restrict from "@/lib/restrict";
import { CalendarDays, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Pagination from "../../my-reservations/_components/Pagination";
import AdminReservationCard from "../_components/AdminReservationCard";
import ReservationFilters, {
   formatFilterDate,
} from "../_components/ReservationFilters";
import getRooms from "@/data-access-layer/room/rooms";

function parsePage(value: string | undefined) {
   const page = Number.parseInt(value ?? "1", 10);
   return Number.isInteger(page) && page > 0 ? page : 1;
}

async function Suspended({
   searchParams,
}: {
   searchParams: Promise<{
      page?: string;
      roomId?: string;
      date?: string;
   }>;
}) {
   await restrict(["ADMIN", "STAFF"], roomsPage);
   const params = await searchParams;
   const page = parsePage(params.page);
   const roomId = params.roomId || undefined;
   const date = formatFilterDate(params.date);
   const [{ completed, completedTotal }, rooms] = await Promise.all([
      getCompletedReservations({
         page,
         pageSize: reservationsPageSize,
         roomId,
         date,
      }),
      getRooms({ id: true, room_name: true }),
   ]);

   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <header className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3">
            <div>
               <Link
                  href={reservationsPage}
                  className="text-base-300 flex items-center gap-1 text-sm font-semibold hover:brightness-125"
               >
                  <span>
                     <ChevronLeft size={15} />
                  </span>
                  Back to reservations
               </Link>
               <h1 className="text-base-400 mt-2 text-3xl font-bold">
                  Completed Reservations
               </h1>
            </div>
            <Link
               href={roomsPage}
               className="bg-base-300 text-base-100 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-110"
            >
               Browse rooms
            </Link>
         </header>

         <main className="mx-auto mt-8 max-w-5xl">
            <ReservationFilters
               rooms={rooms}
               pathname="/reservations/past"
               roomId={roomId}
               date={date}
            />
            <div className="mb-3 flex items-center justify-between">
               <h2 className="text-xl font-semibold">Completed reservations</h2>
               <span className="text-sm text-gray-500">
                  {completedTotal} bookings
               </span>
            </div>
            {completed.length > 0 ? (
               <>
                  <div className="grid gap-4 opacity-90">
                     {completed.map((reservation) => (
                        <AdminReservationCard
                           key={reservation.id}
                           reservation={reservation}
                        />
                     ))}
                  </div>
                  <Pagination
                     page={page}
                     total={completedTotal}
                     param="page"
                     pageSize={reservationsPageSize}
                     query={{ roomId, date }}
                  />
               </>
            ) : (
               <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                  <CalendarDays className="mx-auto text-gray-400" size={28} />
                  <p className="mt-3 font-medium">No completed reservations</p>
                  <p className="mt-1 text-sm text-gray-500">
                     Completed reservations will appear here.
                  </p>
               </div>
            )}
         </main>
      </div>
   );
}

function ReservationSkeleton() {
   return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
         <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
               <div className="h-5 w-40 rounded bg-gray-200" />
               <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-200" />
         </div>
         <div className="mt-4 grid gap-3 border-t border-gray-200 pt-3 sm:grid-cols-3">
            <div className="h-5 rounded bg-gray-200" />
            <div className="h-5 rounded bg-gray-200" />
            <div className="h-5 rounded bg-gray-200" />
         </div>
         <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />
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
               <div className="mt-2 h-9 w-64 rounded bg-gray-200" />
               <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
            </div>
            <div className="h-10 w-32 rounded-md bg-gray-200" />
         </header>
         <main className="mx-auto mt-8 max-w-5xl">
            <div className="mb-3 flex items-center justify-between">
               <div className="h-7 w-56 rounded bg-gray-200" />
               <div className="h-4 w-20 rounded bg-gray-200" />
            </div>
            <div className="grid gap-4">
               <ReservationSkeleton />
               <ReservationSkeleton />
            </div>
         </main>
      </div>
   );
}

export default function PastReservationsPage({
   searchParams,
}: {
   searchParams: Promise<{
      page?: string;
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
