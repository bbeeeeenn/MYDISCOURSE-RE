import { reservationsPage, roomsPage, signInPage } from "@/constants";
import CancelReservationButton from "./_components/CancelReservationButton";
import AttendanceConfirmationButton from "./_components/AttendanceConfirmationButton";
import Back from "@/components/ui/Back";
import { auth } from "@/lib/auth";
import { formatPhilippineTime, getPhilippineDateTimeInputs } from "@/lib/date";
import prisma from "@/lib/prisma";
import { CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Suspense } from "react";

function getReservationStatusText({
   now,
   startTime,
   endTime,
   checkedInAt,
   checkedOutAt,
}: {
   now: Date;
   startTime: Date;
   endTime: Date;
   checkedInAt: Date | null;
   checkedOutAt: Date | null;
}) {
   if (checkedOutAt || endTime < now) return "Completed";
   if (checkedInAt) return "Checked in";
   if (now < startTime) return "Scheduled";
   if (now < endTime) return "Ready for check-in";
   return "Expired";
}

export default async function ReservationPage({
   params,
}: {
   params: Promise<{ reservation: string }>;
}) {
   return (
      <Suspense>
         <Suspended params={params} />
      </Suspense>
   );
}

async function Suspended({
   params,
}: {
   params: Promise<{ reservation: string }>;
}) {
   const session = await auth();
   if (!session?.user) redirect(signInPage);
   if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      redirect(roomsPage);
   }

   const { reservation: reservationId } = await params;
   const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
         room: {
            select: {
               id: true,
               room_name: true,
               location: true,
               capacity: true,
            },
         },
         user: {
            select: {
               name: true,
               email: true,
               role: true,
               id_number: true,
            },
         },
      },
   });

   if (!reservation) {
      redirect(reservationsPage);
   }

   const now = new Date();
   const isCompleted = !!reservation.checkedOutAt || reservation.endTime < now;
   const canCheckIn =
      !isCompleted &&
      !reservation.checkedInAt &&
      reservation.startTime <= now &&
      now < reservation.endTime;
   const canCheckOut =
      !isCompleted && !!reservation.checkedInAt && !reservation.checkedOutAt;
   const canCancel = !reservation.checkedInAt;
   const reservationDate = getPhilippineDateTimeInputs(
      reservation.startTime,
   ).date;
   const statusText = getReservationStatusText({
      now,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      checkedInAt: reservation.checkedInAt,
      checkedOutAt: reservation.checkedOutAt,
   });
   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <Back path={reservationsPage} />
         <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
               {reservation.room.room_name}
            </h1>

            <Link
               href={`${roomsPage}/${reservation.room.id}?date=${reservationDate}`}
               className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
            >
               View room on {reservationDate}
            </Link>
         </div>

         <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
               <div className="flex flex-wrap gap-3 border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                     <CalendarDays className="text-secondary" size={18} />
                     <span>
                        {format(reservation.startTime, "EEE, MMM d, yyyy")}
                     </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                     <Clock3 className="text-secondary" size={18} />
                     <span>
                        {formatPhilippineTime(reservation.startTime)} -{" "}
                        {formatPhilippineTime(reservation.endTime)}
                     </span>
                  </div>
               </div>

               <div className="mt-5 space-y-4 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                     <UsersRound className="text-secondary mt-0.5" size={18} />
                     <div>
                        <p className="font-semibold text-gray-900">Occupants</p>
                        <p>
                           {reservation.occupants}{" "}
                           {reservation.occupants === 1 ? "person" : "people"}
                        </p>
                     </div>
                  </div>

                  <div className="flex items-start gap-2">
                     <MapPin className="text-secondary mt-0.5" size={18} />
                     <div>
                        <p className="font-semibold text-gray-900">Location</p>
                        <p>{reservation.room.location}</p>
                     </div>
                  </div>
               </div>

               <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                     Purpose
                  </p>
                  <p className="mt-2 leading-7 text-gray-800">
                     {reservation.purpose}
                  </p>
               </div>
            </section>

            <aside className="space-y-6">
               <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                     Reservation owner
                  </p>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                     <p>
                        <span className="font-semibold text-gray-900">
                           Name:
                        </span>{" "}
                        {reservation.user.name ?? "Unnamed user"}
                     </p>
                     <p>
                        <span className="font-semibold text-gray-900">
                           Email:
                        </span>{" "}
                        {reservation.user.email ?? "No email"}
                     </p>
                     <p>
                        <span className="font-semibold text-gray-900">
                           Role:
                        </span>{" "}
                        {reservation.user.role}
                     </p>
                     {
                        <p>
                           <span className="font-semibold text-gray-900">
                              Student ID:
                           </span>{" "}
                           {reservation.user.id_number ?? "Not provided"}
                        </p>
                     }
                  </div>
               </div>

               <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                     Attendance
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                     <p>
                        <span className="font-semibold text-gray-900">
                           Status:
                        </span>{" "}
                        {statusText}
                     </p>
                     {reservation.checkedInAt && (
                        <p>
                           <span className="font-semibold text-gray-900">
                              Checked in:
                           </span>{" "}
                           {formatPhilippineTime(reservation.checkedInAt)}
                        </p>
                     )}
                     {reservation.checkedOutAt && (
                        <p>
                           <span className="font-semibold text-gray-900">
                              Checked out:
                           </span>{" "}
                           {formatPhilippineTime(reservation.checkedOutAt)}
                        </p>
                     )}
                  </div>

                  <div className="mt-5 space-y-3">
                     {!isCompleted && canCheckIn && (
                        <AttendanceConfirmationButton
                           reservationId={reservation.id}
                           action="CHECK_IN"
                        />
                     )}

                     {!isCompleted && canCheckOut && (
                        <AttendanceConfirmationButton
                           reservationId={reservation.id}
                           action="CHECK_OUT"
                        />
                     )}

                     {!isCompleted && !canCheckIn && !canCheckOut && (
                        <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                           {reservation.checkedInAt && !reservation.checkedOutAt
                              ? "This reservation is already checked in. It will be available for time-out after the scheduled end time."
                              : reservation.checkedOutAt
                                ? "This reservation has already been completed."
                                : "Attendance actions will unlock automatically when the reservation time window starts and ends."}
                        </div>
                     )}

                     {canCancel && (
                        <CancelReservationButton
                           reservationId={reservation.id}
                        />
                     )}
                  </div>
               </div>
            </aside>
         </div>
      </div>
   );
}
