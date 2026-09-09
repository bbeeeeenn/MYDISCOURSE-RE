import { format, isValid, parseISO } from "date-fns";
import Link from "next/link";

type RoomOption = {
   id: string;
   room_name: string;
};

export default function ReservationFilters({
   rooms,
   pathname,
   roomId,
   date,
}: {
   rooms: RoomOption[];
   pathname: string;
   roomId?: string;
   date?: string;
}) {
   const selectedDate = date && isValid(parseISO(date)) ? date : "";

   return (
      <form
         action={pathname}
         method="get"
         className="mb-6 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end"
      >
         <label className="grid gap-1 text-sm font-medium text-gray-700">
            Room
            <select
               name="roomId"
               defaultValue={roomId ?? ""}
               className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 font-normal"
            >
               <option value="">All rooms</option>
               {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                     {room.room_name}
                  </option>
               ))}
            </select>
         </label>
         <label className="grid gap-1 text-sm font-medium text-gray-700">
            Date
            <input
               type="date"
               name="date"
               defaultValue={selectedDate}
               className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 font-normal"
            />
         </label>
         <button
            type="submit"
            className="bg-base-300 text-base-100 h-10 rounded-md px-4 text-sm font-semibold transition hover:brightness-110"
         >
            Filter
         </button>
         <Link
            href={pathname}
            className="flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
         >
            Clear
         </Link>
      </form>
   );
}

export function formatFilterDate(date: string | undefined) {
   if (!date) return undefined;
   const parsedDate = parseISO(date);
   return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : undefined;
}
