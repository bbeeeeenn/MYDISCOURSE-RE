"use client";

import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { RoomModel } from "@/generated/prisma/models";
import createReservation from "@/actions/reservations/create";
import { profilePage } from "@/constants";
import { getPhilippineToday } from "@/lib/date";
import clsx from "clsx";
import {
   CalendarDays,
   Clock3,
   FileText,
   LoaderCircle,
   Plus,
   UsersRound,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SubmitEvent, useActionState, useRef } from "react";
import { toast } from "react-toastify";

export default function CreateReservation({
   room,
   dateParam,
}: {
   room: RoomModel;
   dateParam?: string;
}) {
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const dialogRef = useRef<HTMLDialogElement>(null);

   return (
      <>
         <button
            onClick={() => toggleDialog(dialogRef, true)}
            className="bg-base-200 text-base-100 flex w-fit items-center gap-1 rounded-md px-6 py-2 font-medium tracking-wide"
         >
            <span>
               <Plus />
            </span>
            Create Reservation
         </button>

         <Dialog
            key={pathname + searchParams.toString()}
            title="Create Reservation"
            dialogRef={dialogRef}
            onClose={() => toggleDialog(dialogRef, false)}
         >
            <ReservationForm
               room={room}
               dateParam={dateParam}
               closeDialog={() => toggleDialog(dialogRef, false)}
            />
         </Dialog>
      </>
   );
}

function ReservationForm({
   room,
   dateParam,
   closeDialog,
}: {
   room: RoomModel;
   dateParam?: string;
   closeDialog: () => void;
}) {
   const today = getPhilippineToday();
   const selectedDate = dateParam && dateParam >= today ? dateParam : today;
   const router = useRouter();
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await createReservation(room.id, formData);
         toast(result.ok ? result.data.message : result.message, {
            type: result.ok ? "success" : "error",
            position: "bottom-right",
         });
         if (result.ok) {
            closeDialog();
            router.refresh();
         }
         if (
            !result.ok &&
            result.message ===
               "Complete your profile before creating a reservation"
         ) {
            router.push(profilePage);
         }
         return result;
      },
      undefined,
   );

   const preventWhilePending = (event: SubmitEvent<HTMLFormElement>) => {
      const date = event.currentTarget.elements.namedItem(
         "scheduledDate",
      ) as HTMLInputElement;
      const startTime = event.currentTarget.elements.namedItem(
         "startTime",
      ) as HTMLInputElement;
      const endTime = event.currentTarget.elements.namedItem(
         "endTime",
      ) as HTMLInputElement;
      const selectedDate = date.value
         ? new Date(`${date.value}T00:00:00`)
         : null;
      const isWeekday = selectedDate !== null && selectedDate.getDay() !== 0;
      const validHours =
         startTime.value >= "08:00" &&
         endTime.value <= "18:00" &&
         startTime.value < endTime.value;

      date.setCustomValidity(
         isWeekday ? "" : "Reservations are available Monday through Saturday",
      );
      startTime.setCustomValidity(
         validHours ? "" : "Choose a time between 8:00 AM and 6:00 PM",
      );
      endTime.setCustomValidity(
         validHours ? "" : "Choose a time between 8:00 AM and 6:00 PM",
      );

      if (isPending || !isWeekday || !validHours) event.preventDefault();
   };

   return (
      <div className="overflow-x-auto">
         <form
            action={formAction}
            onSubmit={preventWhilePending}
            className="grid max-h-120 min-w-75 gap-5 overflow-y-auto px-4 py-5 sm:px-6"
         >
            <div className="mb-2 space-y-2">
               <p className="text-base-400 text-xl font-bold">
                  {room.room_name}
               </p>
               <p className="text-sm text-gray-600">
                  Capacity: {room.capacity} people
               </p>
            </div>

            <fieldset className="grid gap-3">
               <legend className="mb-1 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-800 uppercase">
                  <CalendarDays className="text-secondary" size={18} />
                  Schedule
               </legend>
               <label
                  className="grid gap-1.5 text-sm font-medium text-gray-700"
                  htmlFor="reservation-date"
               >
                  Date
                  <input
                     id="reservation-date"
                     name="scheduledDate"
                     type="date"
                     min={today}
                     defaultValue={selectedDate}
                     required
                     className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                  />
               </label>
               <div className="grid grid-cols-2 gap-3">
                  <label
                     className="grid gap-1.5 text-sm font-medium text-gray-700"
                     htmlFor="start-time"
                  >
                     Start time
                     <input
                        id="start-time"
                        name="startTime"
                        type="time"
                        min="08:00"
                        max="18:00"
                        required
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                     />
                  </label>
                  <label
                     className="grid gap-1.5 text-sm font-medium text-gray-700"
                     htmlFor="end-time"
                  >
                     End time
                     <input
                        id="end-time"
                        name="endTime"
                        type="time"
                        min="08:00"
                        max="18:00"
                        required
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                     />
                  </label>
               </div>
               <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock3 size={14} /> Reservations are available Monday to
                  Saturday, 8:00 AM to 6:00 PM.
               </p>
            </fieldset>

            <fieldset className="grid gap-3 border-t border-gray-200 pt-4">
               <legend className="mb-1 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-800 uppercase">
                  <FileText className="text-secondary" size={18} />
                  Reservation details
               </legend>
               <label
                  className="grid gap-1.5 text-sm font-medium text-gray-700"
                  htmlFor="occupants"
               >
                  <span className="flex items-center gap-1.5">
                     <UsersRound size={16} /> Occupants
                  </span>
                  <input
                     id="occupants"
                     name="occupants"
                     type="number"
                     min={1}
                     max={room.capacity}
                     defaultValue={1}
                     required
                     className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                  />
               </label>
               <label
                  className="grid gap-1.5 text-sm font-medium text-gray-700"
                  htmlFor="purpose"
               >
                  Purpose
                  <textarea
                     id="purpose"
                     name="purpose"
                     rows={3}
                     placeholder="What will the room be used for?"
                     required
                     className="resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm outline-none placeholder:text-gray-400"
                  />
               </label>
            </fieldset>
            {state && !state.ok && (
               <p className="text-sm text-red-700" role="alert">
                  {state.message}
               </p>
            )}
            <button
               type="submit"
               disabled={isPending}
               className={clsx(
                  "bg-base-300 text-base-100 mt-1 flex items-center justify-center gap-2 rounded-md py-3 text-base font-bold shadow-sm transition hover:brightness-110",
                  isPending && "opacity-75",
               )}
            >
               {isPending && <LoaderCircle className="animate-spin" />}
               {isPending ? "Creating" : "Create reservation"}
            </button>
         </form>
      </div>
   );
}
