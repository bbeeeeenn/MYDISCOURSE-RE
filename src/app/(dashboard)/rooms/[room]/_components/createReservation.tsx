"use client";

import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { RoomModel } from "@/generated/prisma/models";
import createReservation from "@/actions/reservations/create";
import { profilePage } from "@/constants";
import { getPhilippineToday } from "@/lib/date";
import clsx from "clsx";
import { LoaderCircle, Plus } from "lucide-react";
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
            className="grid min-w-75 gap-3 px-4 py-6"
         >
            <p className="font-semibold text-gray-700">{room.room_name}</p>
            <label
               className="grid gap-1 text-gray-700"
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
                  className="rounded-sm border-2 border-gray-500 p-1 text-lg"
               />
            </label>
            <div className="grid grid-cols-2 gap-3">
               <label className="text-gray-700" htmlFor="start-time">
                  Start time
                  <input
                     id="start-time"
                     name="startTime"
                     type="time"
                     min="08:00"
                     max="18:00"
                     required
                     className="w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
                  />
               </label>
               <label className="text-gray-700" htmlFor="end-time">
                  End time
                  <input
                     id="end-time"
                     name="endTime"
                     type="time"
                     min="08:00"
                     max="18:00"
                     required
                     className="w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
                  />
               </label>
            </div>
            <label className="grid gap-1 text-gray-700" htmlFor="occupants">
               Occupants
               <input
                  id="occupants"
                  name="occupants"
                  type="number"
                  min={1}
                  max={room.capacity}
                  defaultValue={1}
                  required
                  className="rounded-sm border-2 border-gray-500 p-1 text-lg"
               />
            </label>
            <label className="grid gap-1 text-gray-700" htmlFor="purpose">
               Purpose
               <textarea
                  id="purpose"
                  name="purpose"
                  rows={3}
                  required
                  className="resize-y rounded-sm border-2 border-gray-500 p-1 text-lg"
               />
            </label>
            {state && !state.ok && (
               <p className="text-sm text-red-700" role="alert">
                  {state.message}
               </p>
            )}
            <button
               type="submit"
               disabled={isPending}
               className={clsx(
                  "bg-base-200 text-base-100 mt-1 flex items-center justify-center gap-2 rounded-md py-2 text-lg font-medium",
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
