"use client";

import editReservation from "@/actions/reservations/edit";
import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { getPhilippineToday } from "@/lib/date";
import clsx from "clsx";
import { LoaderCircle, Pen } from "lucide-react";
import { useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function EditReservationButton({
   reservationId,
   roomName,
   capacity,
   date,
   startTime,
   endTime,
   occupants,
   purpose,
}: {
   reservationId: string;
   roomName: string;
   capacity: number;
   date: string;
   startTime: string;
   endTime: string;
   occupants: number;
   purpose: string;
}) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const router = useRouter();
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await editReservation(reservationId, formData);
         toast(result.ok ? result.data.message : result.message, {
            type: result.ok ? "success" : "error",
            position: "bottom-right",
         });
         if (result.ok) {
            toggleDialog(dialogRef, false);
            router.refresh();
         }
         return result;
      },
      undefined,
   );
   const [selectedDate, setSelectedDate] = useState(date);
   const today = getPhilippineToday();

   return (
      <>
         <button
            type="button"
            onClick={() => {
               setSelectedDate(date);
               toggleDialog(dialogRef, true);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-base-300 transition hover:brightness-125"
         >
            <Pen size={16} />
            Edit reservation
         </button>
         <Dialog
            title="Edit Reservation"
            dialogRef={dialogRef}
            onClose={() => toggleDialog(dialogRef, false)}
         >
            <form action={formAction} className="grid min-w-75 gap-3 px-4 py-6">
               <p className="font-semibold text-gray-700">{roomName}</p>
               <label className="grid gap-1 text-gray-700" htmlFor={`${reservationId}-date`}>
                  Date
                  <input
                     id={`${reservationId}-date`}
                     name="scheduledDate"
                     type="date"
                     min={today}
                     value={selectedDate}
                     onChange={(event) => setSelectedDate(event.target.value)}
                     required
                     className="rounded-sm border-2 border-gray-500 p-1 text-lg"
                  />
               </label>
               <div className="grid grid-cols-2 gap-3">
                  <label className="text-gray-700" htmlFor={`${reservationId}-start`}>
                     Start time
                     <input
                        id={`${reservationId}-start`}
                        name="startTime"
                        type="time"
                        min="08:00"
                        max="18:00"
                        defaultValue={startTime}
                        required
                        className="w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
                     />
                  </label>
                  <label className="text-gray-700" htmlFor={`${reservationId}-end`}>
                     End time
                     <input
                        id={`${reservationId}-end`}
                        name="endTime"
                        type="time"
                        min="08:00"
                        max="18:00"
                        defaultValue={endTime}
                        required
                        className="w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
                     />
                  </label>
               </div>
               <label className="grid gap-1 text-gray-700" htmlFor={`${reservationId}-occupants`}>
                  Occupants
                  <input
                     id={`${reservationId}-occupants`}
                     name="occupants"
                     type="number"
                     min={1}
                     max={capacity}
                     defaultValue={occupants}
                     required
                     className="rounded-sm border-2 border-gray-500 p-1 text-lg"
                  />
               </label>
               <label className="grid gap-1 text-gray-700" htmlFor={`${reservationId}-purpose`}>
                  Purpose
                  <textarea
                     id={`${reservationId}-purpose`}
                     name="purpose"
                     rows={3}
                     defaultValue={purpose}
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
                  {isPending ? "Saving" : "Save changes"}
               </button>
            </form>
         </Dialog>
      </>
   );
}