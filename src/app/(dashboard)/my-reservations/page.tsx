import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getMyReservations } from "@/data-access-layer/reservations/myReservations";
import { pastReservationsPage, reservationsPageSize } from "@/constants";
import Pagination from "./_components/Pagination";
import ReservationCard from "./_components/ReservationCard";

function parsePage(value: string | undefined) {
   const page = Number.parseInt(value ?? "1", 10);
   return Number.isInteger(page) && page > 0 ? page : 1;
}

async function Suspended({
   searchParams,
}: {
   searchParams: Promise<{ upcomingPage?: string }>;
}) {
   const params = await searchParams;
   const upcomingPage = parsePage(params.upcomingPage);
   const { ongoing, upcoming, upcomingTotal } = await getMyReservations({
      upcomingPage,
      pageSize: reservationsPageSize,
   });

   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <header className="mx-auto max-w-5xl">
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
               <h1 className="text-base-400 text-3xl font-bold">
                  My Reservations
               </h1>
               <Link
                  href="/rooms"
                  className="bg-base-300 text-base-100 rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition hover:brightness-110"
               >
                  Browse rooms
               </Link>
            </div>
         </header>

         <main className="mx-auto mt-8 max-w-5xl space-y-8">
            {ongoing.length > 0 && (
               <section>
                  <div className="mb-3">
                     <h2 className="text-xl font-semibold">Ongoing</h2>
                  </div>
                  <div className="grid gap-4">
                     {ongoing.map((reservation) => (
                        <ReservationCard
                           key={reservation.id}
                           reservation={reservation}
                           status="ongoing"
                        />
                     ))}
                  </div>
               </section>
            )}

            <section>
               <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Upcoming</h2>
                  <span className="text-sm text-gray-500">
                     {upcomingTotal} bookings
                  </span>
               </div>
               {upcoming.length ? (
                  <>
                     <div className="grid gap-4">
                        {upcoming.map((reservation) => (
                           <ReservationCard
                              key={reservation.id}
                              reservation={reservation}
                              status="upcoming"
                           />
                        ))}
                     </div>
                     <Pagination
                        page={upcomingPage}
                        total={upcomingTotal}
                        param="upcomingPage"
                        pageSize={reservationsPageSize}
                     />
                  </>
               ) : (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                     <CalendarDays
                        className="mx-auto text-gray-400"
                        size={28}
                     />
                     <p className="mt-3 font-medium">
                        No upcoming reservations
                     </p>
                     <p className="mt-1 text-sm text-gray-500">
                        Find a room and reserve a time that works for you.
                     </p>
                  </div>
               )}
            </section>

            <Link
               href={pastReservationsPage}
               className="text-base-300 flex w-fit items-center gap-2 font-semibold hover:brightness-125"
            >
               View past reservations
               <span>
                  <ChevronRight size={15} />
               </span>
            </Link>
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
            <div className="h-9 w-56 rounded bg-gray-200" />
            <div className="h-10 w-32 rounded-md bg-gray-200" />
         </header>
         <main className="mx-auto mt-8 max-w-5xl">
            <div className="mb-3 flex items-center justify-between">
               <div className="h-7 w-28 rounded bg-gray-200" />
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

export default async function MyReservationsPage({
   searchParams,
}: {
   searchParams: Promise<{ upcomingPage?: string }>;
}) {
   return (
      <Suspense fallback={<ReservationsFallback />}>
         <Suspended searchParams={searchParams} />
      </Suspense>
   );
}
