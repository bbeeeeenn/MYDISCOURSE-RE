import {
   pastReservationsAdminPage,
   reservationsPage,
   reservationsPageSize,
   roomsPage,
} from "@/constants";
import { getAllReservations } from "@/data-access-layer/reservations/allReservations";
import getRooms from "@/data-access-layer/room/rooms";
import restrict from "@/lib/restrict";
import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Pagination from "../my-reservations/_components/Pagination";
import AdminReservationCard from "./_components/AdminReservationCard";
import ReservationFilters, {
   formatFilterDate,
} from "./_components/ReservationFilters";

function parsePage(value: string | undefined) {
   const page = Number.parseInt(value ?? "1", 10);
   return Number.isInteger(page) && page > 0 ? page : 1;
}

async function Suspended({
   searchParams,
}: {
   searchParams: Promise<{
      upcomingPage?: string;
      roomId?: string;
      date?: string;
   }>;
}) {
   await restrict(["ADMIN", "STAFF"], roomsPage);
   const params = await searchParams;
   const upcomingPage = parsePage(params.upcomingPage);
   const roomId = params.roomId || undefined;
   const date = formatFilterDate(params.date);
   const [{ upcoming, upcomingTotal }, rooms] = await Promise.all([
      getAllReservations({
         upcomingPage,
         pageSize: reservationsPageSize,
         roomId,
         date,
      }),
      getRooms(),
   ]);

   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <header className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-3">
            <h1 className="text-base-400 text-3xl font-bold">
               All Reservations
            </h1>
            <Link
               href="/rooms"
               className="bg-base-300 text-base-100 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-110"
            >
               Browse rooms
            </Link>
         </header>

         <main className="mx-auto mt-8 max-w-5xl">
            <ReservationFilters
               rooms={rooms}
               pathname={reservationsPage}
               roomId={roomId}
               date={date}
            />
            <ReservationSection
               title="Upcoming reservations"
               emptyTitle="No upcoming reservations"
               emptyDescription="Upcoming reservations made by users will appear here."
               reservations={upcoming}
               page={upcomingPage}
               total={upcomingTotal}
               param="upcomingPage"
               query={{ roomId, date }}
            />
            <Link
               href={pastReservationsAdminPage}
               className="text-base-300 flex items-center gap-1 font-semibold hover:brightness-125"
            >
               View completed reservations
               <span>
                  <ChevronRight size={15} />
               </span>
            </Link>
         </main>
      </div>
   );
}

function ReservationSection({
   title,
   emptyTitle,
   emptyDescription,
   reservations,
   page,
   total,
   param,
   query,
   muted = false,
}: {
   title: string;
   emptyTitle: string;
   emptyDescription: string;
   reservations: React.ComponentProps<
      typeof AdminReservationCard
   >["reservation"][];
   page: number;
   total: number;
   param: string;
   query?: Record<string, string | undefined>;
   muted?: boolean;
}) {
   return (
      <section className="mb-8 last:mb-0">
         <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <span className="text-sm text-gray-500">{total} bookings</span>
         </div>
         {reservations.length > 0 ? (
            <>
               <div className={`grid gap-4 ${muted ? "opacity-90" : ""}`}>
                  {reservations.map((reservation) => (
                     <AdminReservationCard
                        key={reservation.id}
                        reservation={reservation}
                     />
                  ))}
               </div>
               <Pagination
                  page={page}
                  total={total}
                  param={param}
                  pageSize={reservationsPageSize}
                  query={query}
               />
            </>
         ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
               <CalendarDays className="mx-auto text-gray-400" size={28} />
               <p className="mt-3 font-medium">{emptyTitle}</p>
               <p className="mt-1 text-sm text-gray-500">{emptyDescription}</p>
            </div>
         )}
      </section>
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
            <div className="h-9 w-56 rounded bg-gray-200" />
            <div className="h-10 w-32 rounded-md bg-gray-200" />
         </header>
         <main className="mx-auto mt-8 max-w-5xl">
            <div className="mb-3 flex items-center justify-between">
               <div className="h-7 w-48 rounded bg-gray-200" />
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

export default function ReservationsPage({
   searchParams,
}: {
   searchParams: Promise<{
      upcomingPage?: string;
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
