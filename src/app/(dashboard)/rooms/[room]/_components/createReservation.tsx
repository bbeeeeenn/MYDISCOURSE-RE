"use client";

import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { RoomModel } from "@/generated/prisma/models";
import createReservation from "@/actions/reservations/create";
import { profilePage, signInPage } from "@/constants";
import { getPhilippineToday, parsePhilippineDateTime } from "@/lib/date";
import clsx from "clsx";
import {
   CalendarDays,
   Clock3,
   FileText,
   LoaderCircle,
   Plus,
   Trash2,
   UsersRound,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SubmitEvent, useActionState, useRef, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { IdNumberInput } from "@/components/ui/IdNumberInput";

export default function CreateReservation({
   room,
   dateParam,
}: {
   room: RoomModel;
   dateParam?: string;
}) {
   const session = useSession();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const dialogRef = useRef<HTMLDialogElement>(null);

   return (
      <>
         {session.status === "authenticated" ? (
            <button
               onClick={() => toggleDialog(dialogRef, true)}
               className="bg-base-200 text-base-100 flex w-fit items-center gap-1 rounded-md px-6 py-2 font-medium tracking-wide"
            >
               <span>
                  <Plus />
               </span>
               Create Reservation
            </button>
         ) : (
            <Link
               href={signInPage}

               className={clsx(
                  "bg-base-200 text-base-100 flex w-fit items-center gap-1 rounded-md px-6 py-2 font-medium tracking-wide",
                  session.status === "loading" && "pointer-events-none",
               )}
            >
               <span>
                  <Plus />
               </span>
               Create Reservation
            </Link>
         )}

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

   const [occupants, setOccupants] = useState<Set<string>>(new Set([]));
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const scheduledDate = String(formData.get("scheduledDate") || "");
         const startTime = String(formData.get("startTime") || "");
         const endTime = String(formData.get("endTime") || "");
         const purpose = String(formData.get("purpose") || "").trim();
         const result = await createReservation(
            room.id,
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
   const [acceptedTermsAndConditions, setAcceptedTermsAndConditions] =
      useState(false);

   const validateClientside = (event: SubmitEvent<HTMLFormElement>) => {
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
      const isAvailableDayOfWeek =
         selectedDate !== null && selectedDate.getDay() !== 0;
      const start =
         date.value && startTime.value
            ? parsePhilippineDateTime(date.value, startTime.value)
            : null;
      const end =
         date.value && endTime.value
            ? parsePhilippineDateTime(date.value, endTime.value)
            : null;
      const now = Date.now();
      const isWithinBookingWindow =
         start !== null &&
         end !== null &&
         start.getTime() + 10 * 60 * 1000 > now &&
         end.getTime() > now;
      const validHours =
         startTime.value >= "08:00" &&
         endTime.value <= "18:00" &&
         startTime.value < endTime.value;

      date.setCustomValidity(
         !isAvailableDayOfWeek
            ? "Reservations are available Monday through Saturday"
            : !isWithinBookingWindow
              ? "The reservation time window has already passed"
              : "",
      );
      startTime.setCustomValidity(
         validHours ? "" : "Choose a time between 8:00 AM and 6:00 PM",
      );
      endTime.setCustomValidity(
         validHours ? "" : "Choose a time between 8:00 AM and 6:00 PM",
      );

      if (
         isPending ||
         !acceptedTermsAndConditions ||
         !isAvailableDayOfWeek ||
         !isWithinBookingWindow ||
         !validHours
      )
         event.preventDefault();
   };

   return (
      <form
         action={formAction}
         onSubmit={validateClientside}
         className="flex min-w-75 flex-col"
      >
         <div className="grid max-h-100 gap-5 overflow-y-auto px-4 pt-5 pb-10 sm:px-6">
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
                  <p>Date</p>
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
                     <p>Start time</p>
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
                     <p>End time</p>
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
                     <UsersRound size={16} /> Occupants:
                     <span
                        className={clsx(
                           occupants.size >= room.capacity && "text-red-500",
                        )}
                     >
                        {occupants.size}/{room.capacity}{" "}
                        {occupants.size >= room.capacity && "(Full)"}
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
                                 <Trash2 size={15} className="text-red-500" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
                  <p className="flex items-center gap-1 text-xs font-light">
                     Student ID Number
                  </p>
                  {occupants.size < room.capacity && (
                     <IdNumberInput
                        callback={(input) => {
                           setOccupants((prev) => new Set(prev).add(input));
                        }}
                     />
                  )}
               </label>
               <label
                  className="grid gap-1.5 text-sm font-medium text-gray-700"
                  htmlFor="purpose"
               >
                  <p>Purpose</p>
                  <textarea
                     id="purpose"
                     name="purpose"
                     rows={3}
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
         <div className="flex flex-col gap-y-1 border-t border-gray-200 p-2">
            <div className="flex items-start gap-x-2 px-2">
               <input
                  type="checkbox"
                  name="tc"
                  id="tc"
                  checked={acceptedTermsAndConditions}
                  onChange={(e) =>
                     setAcceptedTermsAndConditions(e.target.checked)
                  }
                  className="accent-base-300 mt-1.5"
               />
               <label htmlFor="tc" className="text-justify text-sm">
                  I agree to the{" "}
                  <Link href={""} className="text-blue-400 underline">
                     terms and conditions
                  </Link>{" "}
                  to use this room responsibly, keep noise low, leave it clean,
                  and vacate on time. I understand misuse may result in
                  suspended access.
               </label>
            </div>
            <button
               type="submit"
               disabled={isPending || !acceptedTermsAndConditions}
               className={clsx(
                  "bg-base-300 text-base-100 mt-1 flex items-center justify-center gap-2 rounded-md py-3 text-base font-bold shadow-sm transition hover:brightness-110",
                  "disabled:cursor-not-allowed! disabled:opacity-50",
               )}
            >
               {isPending && <LoaderCircle className="animate-spin" />}
               {isPending ? "Creating" : "Create reservation"}
            </button>
         </div>
      </form>
   );
}
