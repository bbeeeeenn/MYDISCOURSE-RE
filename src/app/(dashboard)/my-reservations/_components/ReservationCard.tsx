import { formatPhilippineTime, getPhilippineDateTimeInputs } from "@/lib/date";
import { CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import { format } from "date-fns";
import CancelReservationButton from "./CancelReservationButton";
import EditReservationButton from "./EditReservationButton";

export type Reservation = {
   id: string;
   startTime: Date;
   endTime: Date;
   occupants: number;
   purpose: string;
   room: { room_name: string; location: string; capacity: number };
};

export default function ReservationCard({
   reservation,
   status,
}: {
   reservation: Reservation;
   status: "upcoming" | "ongoing" | "past";
}) {
   return (
      <article className="bg-base-100 border-base-200/30 rounded-lg border p-4 shadow-sm">
         <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
               <p className="text-base-400 text-lg font-semibold">
                  {reservation.room.room_name}
               </p>
               <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                  <MapPin size={16} />
                  {reservation.room.location}
               </p>
            </div>
            <span
               className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  status === "past"
                     ? "bg-gray-100 text-gray-600"
                     : status === "ongoing"
                       ? "bg-amber-100 text-amber-700"
                       : "bg-green-100 text-green-700"
               }`}
            >
               {status === "past"
                  ? "Completed"
                  : status === "ongoing"
                    ? "Ongoing"
                    : "Upcoming"}
            </span>
         </div>

         <div className="mt-4 grid gap-3 border-t border-gray-200 pt-3 text-sm text-gray-700 sm:grid-cols-3">
            <p className="flex items-center gap-2">
               <CalendarDays className="text-secondary" size={18} />
               {format(reservation.startTime, "EEE, MMM d, yyyy")}
            </p>
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

         <p className="mt-4 text-sm leading-6 text-gray-700">
            {reservation.purpose}
         </p>
         {status === "upcoming" && (
            <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-200 pt-3">
               <EditReservationButton
                  reservationId={reservation.id}
                  roomName={reservation.room.room_name}
                  capacity={reservation.room.capacity}
                  date={getPhilippineDateTimeInputs(reservation.startTime).date}
                  startTime={getPhilippineDateTimeInputs(reservation.startTime).time}
                  endTime={getPhilippineDateTimeInputs(reservation.endTime).time}
                  occupants={reservation.occupants}
                  purpose={reservation.purpose}
               />
               <CancelReservationButton reservationId={reservation.id} />
            </div>
         )}
      </article>
   );
}