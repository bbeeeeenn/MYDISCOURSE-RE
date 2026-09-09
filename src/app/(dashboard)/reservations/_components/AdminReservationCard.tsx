import { formatPhilippineTime, getPhilippineDateTimeInputs } from "@/lib/date";
import {
   CalendarDays,
   ChevronRight,
   Clock3,
   MapPin,
   UsersRound,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import DeleteReservationButton from "./DeleteReservationButton";
import { roomsPage } from "@/constants";

type AdminReservation = {
   id: string;
   startTime: Date;
   endTime: Date;
   occupants: number;
   purpose: string;
   room: { id: string; room_name: string; location: string };
   user: { name: string | null; email: string | null };
};

export default function AdminReservationCard({
   reservation,
}: {
   reservation: AdminReservation;
}) {
   const status =
      reservation.endTime <= new Date()
         ? "Completed"
         : reservation.startTime <= new Date()
           ? "Ongoing"
           : "Upcoming";
   const date = getPhilippineDateTimeInputs(reservation.startTime).date;
   const statusClass =
      status === "Completed"
         ? "bg-gray-100 text-gray-600"
         : status === "Ongoing"
           ? "bg-amber-100 text-amber-700"
           : "bg-green-100 text-green-700";

   return (
      <article className="bg-base-100 border-base-200/30 rounded-lg border p-4 shadow-sm">
         <Link
            href={`${roomsPage}/${reservation.room.id}?date=${date}`}
            className="group flex flex-wrap items-start justify-between gap-3"
         >
            <div className="min-w-0">
               <p className="text-base-400 flex items-center gap-1 text-lg font-semibold group-hover:underline">
                  {reservation.room.room_name}
                  <span>
                     <ChevronRight size={20} />
                  </span>
               </p>
               <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin size={16} />
                  {reservation.room.location}
               </p>
            </div>
            <span
               className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
            >
               {status}
            </span>
         </Link>

         <div className="mt-4 grid gap-3 border-t border-gray-200 pt-3 text-sm text-gray-700 sm:grid-cols-3">
            <div className="flex items-center gap-2">
               <CalendarDays className="text-secondary" size={18} />
               {format(reservation.startTime, "EEE, MMM d, yyyy")}
            </div>
            <p className="flex items-center gap-2">
               <Clock3 className="text-secondary" size={18} />
               {formatPhilippineTime(reservation.startTime)} -{" "}
               {formatPhilippineTime(reservation.endTime)}
            </p>
            <p className="flex items-center gap-2">
               <UsersRound className="text-secondary" size={18} />
               {reservation.occupants}{" "}
               {reservation.occupants === 1 ? "person" : "people"}
            </p>
         </div>

         <div className="mt-4 grid gap-1 border-t border-gray-200 pt-3 text-sm text-gray-700 sm:grid-cols-2">
            <p>
               <span className="font-semibold">Reserved by:</span>{" "}
               {reservation.user.name ?? "Unnamed user"}
            </p>
            <p>
               <span className="font-semibold">Email:</span>{" "}
               {reservation.user.email ?? "No email"}
            </p>
            <p className="sm:col-span-2">
               <span className="font-semibold">Purpose:</span>{" "}
               {reservation.purpose}
            </p>
         </div>

         <div className="mt-4 border-t border-gray-200 pt-3">
            <DeleteReservationButton reservationId={reservation.id} />
         </div>
      </article>
   );
}
