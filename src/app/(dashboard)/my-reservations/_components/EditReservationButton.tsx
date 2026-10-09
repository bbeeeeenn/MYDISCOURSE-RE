"use client";

import editReservation from "@/actions/reservations/edit";
import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { getPhilippineToday } from "@/lib/date";
import clsx from "clsx";
import {
   CalendarDays,
   Clock3,
   FileText,
   LoaderCircle,
   Pen,
   Trash2,
   UsersRound,
} from "lucide-react";
import { useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { IdNumberInput } from "@/components/ui/IdNumberInput";

export default function EditReservationButton({
   reservationId,
   roomName,
   capacity,
   date,
   startTime,
   endTime,
   occupants: _occupants,
   purpose,
}: {
   reservationId: string;
   roomName: string;
   capacity: number;
   date: string;
   startTime: string;
   endTime: string;
   occupants: string[];
   purpose: string;
}) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const router = useRouter();

   const [occupants, setOccupants] = useState<Set<string>>(new Set(_occupants));
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const scheduledDate = String(formData.get("scheduledDate") || "");
         const startTime = String(formData.get("startTime") || "");
         const endTime = String(formData.get("endTime") || "");
         const purpose = String(formData.get("purpose") || "").trim();

         const result = await editReservation(
            reservationId,
            scheduledDate,
            startTime,
            endTime,
            purpose,
            [...occupants],
         );
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
            className="text-base-300 flex items-center gap-1.5 text-sm font-semibold transition hover:brightness-125"
         >
            <Pen size={16} />
            Edit reservation
         </button>
         <Dialog
            title="Edit Reservation"
            dialogRef={dialogRef}
            onClose={() => toggleDialog(dialogRef, false)}
         >
            <form action={formAction} className="flex min-w-75 flex-col">
               <div className="grid max-h-100 gap-5 overflow-y-auto px-4 py-5 sm:px-6">
                  <div className="mb-2 space-y-2">
                     <p className="text-base-400 text-xl font-bold">
                        {roomName}
                     </p>
                     <p className="text-sm text-gray-600">
                        Capacity: {capacity} people
                     </p>
                  </div>
                  <fieldset className="grid gap-3">
                     <legend className="mb-1 flex items-center gap-2 text-sm font-bold tracking-wide text-gray-800 uppercase">
                        <CalendarDays className="text-secondary" size={18} />
                        Schedule
                     </legend>
                     <label
                        className="grid gap-1.5 text-sm font-medium text-gray-700"
                        htmlFor={`${reservationId}-date`}
                     >
                        Date
                        <input
                           id={`${reservationId}-date`}
                           name="scheduledDate"
                           type="date"
                           min={today}
                           value={selectedDate}
                           onChange={(event) =>
                              setSelectedDate(event.target.value)
                           }
                           required
                           className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                        />
                     </label>
                     <div className="grid grid-cols-2 gap-3">
                        <label
                           className="grid gap-1.5 text-sm font-medium text-gray-700"
                           htmlFor={`${reservationId}-start`}
                        >
                           Start time
                           <input
                              id={`${reservationId}-start`}
                              name="startTime"
                              type="time"
                              min="08:00"
                              max="18:00"
                              defaultValue={startTime}
                              required
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                           />
                        </label>
                        <label
                           className="grid gap-1.5 text-sm font-medium text-gray-700"
                           htmlFor={`${reservationId}-end`}
                        >
                           End time
                           <input
                              id={`${reservationId}-end`}
                              name="endTime"
                              type="time"
                              min="08:00"
                              max="18:00"
                              defaultValue={endTime}
                              required
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm"
                           />
                        </label>
                     </div>
                     <p className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock3 size={14} /> Reservations are available Monday
                        to Saturday, 8:00 AM to 6:00 PM.
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
                           <UsersRound size={16} /> Occupants:
                           <span
                              className={clsx(
                                 occupants.size >= capacity && "text-red-500",
                              )}
                           >
                              {occupants.size}/{capacity}{" "}
                              {occupants.size >= capacity && "(Full)"}
                           </span>
                        </span>
                        <div className="my-2">
                           <div className="mb-1 flex flex-wrap items-center gap-1">
                              {[...occupants].map((occupant) => (
                                 <div
                                    key={occupant}
                                    className="flex w-fit items-center gap-2 rounded-sm border border-gray-300 bg-white px-2 py-1"
                                 >
                                    <span>{occupant}</span>
                                    <button
                                       type="button"
                                       onClick={() =>
                                          setOccupants((prev) => {
                                             const newSet = new Set(prev);
                                             newSet.delete(occupant);
                                             return newSet;
                                          })
                                       }
                                    >
                                       <Trash2
                                          size={15}
                                          className="text-red-500"
                                       />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                        <p className="flex items-center gap-1 text-xs font-light">
                           Student ID Number
                        </p>
                        {occupants.size < capacity && (
                           <IdNumberInput
                              callback={(input) => {
                                 setOccupants((prev) =>
                                    new Set(prev).add(input),
                                 );
                              }}
                           />
                        )}
                     </label>
                     <label
                        className="grid gap-1.5 text-sm font-medium text-gray-700"
                        htmlFor={`${reservationId}-purpose`}
                     >
                        Purpose
                        <textarea
                           id={`${reservationId}-purpose`}
                           name="purpose"
                           rows={3}
                           defaultValue={purpose}
                           placeholder="What will the room be used for?"
                           required
                           className="h-24 max-h-24 min-h-24 resize-none rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base shadow-sm outline-none placeholder:text-gray-400"
                        />
                     </label>
                  </fieldset>
                  {state && !state.ok && (
                     <p className="text-sm text-red-700" role="alert">
                        {state.message}
                     </p>
                  )}
               </div>
               <div className="border-t border-gray-200 p-2">
                  <button
                     type="submit"
                     inert={isPending}
                     disabled={isPending}
                     className={clsx(
                        "bg-base-300 text-base-100 flex w-full items-center justify-center gap-2 rounded-md py-3 text-base font-bold shadow-sm transition hover:brightness-110",
                        isPending && "opacity-50",
                     )}
                  >
                     {isPending && <LoaderCircle className="animate-spin" />}
                     {isPending ? "Saving" : "Save changes"}
                  </button>
               </div>
            </form>
         </Dialog>
      </>
   );
}
