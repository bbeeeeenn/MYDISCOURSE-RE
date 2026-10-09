import { reservationsPage, roomsPage, signInPage } from "@/constants";
import CancelReservationButton from "./_components/CancelReservationButton";
import AttendanceConfirmationButton from "./_components/AttendanceConfirmationButton";
import Back from "@/components/ui/Back";
import { auth } from "@/lib/auth";
import { formatPhilippineTime, getPhilippineDateTimeInputs } from "@/lib/date";
import prisma from "@/lib/prisma";
import {
   CalendarDays,
   Clock3,
   MapPin,
   UserRound,
   UsersRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Suspense } from "react";
import { StudentRecord } from "@/generated/prisma/client";

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
            },
         },
      },
   });

   if (!reservation) {
      redirect(reservationsPage);
   }

   const occupantsInfo = await prisma.studentRecord.findMany({
      where: { id_number: { in: reservation.occupants } },
   });

   const occupantsMap: Map<string, StudentRecord | null> = new Map();
   for (const occupant of reservation.occupants) {
      occupantsMap.set(occupant, null);
   }
   for (const info of occupantsInfo) {
      occupantsMap.set(info.id_number, info);
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
                     <MapPin className="text-secondary mt-0.5" size={18} />
                     <div>
                        <p className="font-semibold text-gray-900">Location</p>
                        <p>{reservation.room.location}</p>
                     </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-base">
                     <p className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase">
                        Purpose
                     </p>
                     <p className="mt-2 leading-7 text-gray-800">
                        {reservation.purpose}
                     </p>
                  </div>
                  <div className="flex items-start gap-2">
                     <UsersRound className="text-secondary mt-0.5" size={18} />
                     <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                           <p className="font-semibold text-gray-900">
                              Occupants
                           </p>
                           <p className="text-xs text-gray-500">
                              {occupantsMap.size}{" "}
                              {occupantsMap.size === 1 ? "person" : "people"}
                           </p>
                        </div>
                        {occupantsMap.size > 0 ? (
                           <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {[...occupantsMap.entries()]
                                 .sort((a, b) => {
                                    if (!a[1] && !b[1]) return -1;
                                    if (a[1] && !b[1]) return -1;
                                    if (!a[1] && b[1]) return 1;

                                    return a[1]!.firstname.localeCompare(
                                       b[1]!.firstname,
                                    );
                                 })
                                 .map(([idnumber, occupant]) => {
                                    const fullName = occupant
                                       ? [
                                            occupant.firstname,
                                            occupant.middlename,
                                            occupant.lastname,
                                         ]
                                            .filter(Boolean)
                                            .join(" ")
                                       : null;

                                    return (
                                       <article
                                          key={idnumber}
                                          className={`rounded-lg border p-4 shadow-sm ${
                                             occupant
                                                ? "border-gray-200 bg-white"
                                                : "border-amber-200 bg-amber-50"
                                          }`}
                                       >
                                          <div className="flex items-start gap-3">
                                             <div
                                                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                                                   occupant
                                                      ? "bg-gray-100 text-gray-600"
                                                      : "bg-amber-100 text-amber-700"
                                                }`}
                                             >
                                                {occupant ? (
                                                   <UserRound size={18} />
                                                ) : (
                                                   <UsersRound size={18} />
                                                )}
                                             </div>
                                             <div className="min-w-0">
                                                <p className="truncate font-semibold text-gray-900">
                                                   {fullName ||
                                                      "Unnamed occupant"}
                                                </p>
                                                <p className="mt-1 font-mono text-xs text-gray-500">
                                                   ID {idnumber}
                                                </p>
                                             </div>
                                          </div>
                                          {occupant ? (
                                             <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-gray-100 pt-3 text-xs">
                                                <div>
                                                   <dt className="text-gray-500">
                                                      Year level
                                                   </dt>
                                                   <dd className="mt-0.5 font-medium text-gray-800">
                                                      {occupant.yearlevel ||
                                                         "Not available"}
                                                   </dd>
                                                </div>
                                                <div>
                                                   <dt className="text-gray-500">
                                                      Program
                                                   </dt>
                                                   <dd className="mt-0.5 truncate font-medium text-gray-800">
                                                      {occupant.program.trim() ||
                                                         "Not available"}
                                                   </dd>
                                                </div>
                                                <div className="col-span-2 flex items-start gap-1.5">
                                                   <div className="min-w-0">
                                                      <dt className="text-gray-500">
                                                         College
                                                      </dt>
                                                      <dd className="mt-0.5 truncate font-medium text-gray-800">
                                                         {occupant.college.trim() ||
                                                            "Not available"}
                                                      </dd>
                                                   </div>
                                                </div>
                                             </dl>
                                          ) : (
                                             <p className="mt-3 border-t border-amber-200 pt-3 text-xs leading-5 text-amber-800">
                                                No student record was found for
                                                this ID number.
                                             </p>
                                          )}
                                       </article>
                                    );
                                 })}
                           </div>
                        ) : (
                           <p className="mt-3 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                              No occupants have been added to this reservation.
                           </p>
                        )}
                     </div>
                  </div>
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
