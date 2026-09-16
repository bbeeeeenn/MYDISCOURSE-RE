"use client";

import markReservationAttendance from "@/actions/reservations/markAttendance";
import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { useRouter } from "next/navigation";
import { useActionState, useRef } from "react";
import { toast } from "react-toastify";

export default function AttendanceConfirmationButton({
   reservationId,
   action,
}: {
   reservationId: string;
   action: "CHECK_IN" | "CHECK_OUT";
}) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const router = useRouter();
   const isCheckIn = action === "CHECK_IN";
   const actionLabel = isCheckIn ? "Time in" : "Time out";
   const [, formAction, isPending] = useActionState(async () => {
      const result = await markReservationAttendance(reservationId, action);
      toast(result.ok ? result.data.message : result.message, {
         type: result.ok ? "success" : "error",
         position: "bottom-right",
      });

      if (result.ok) {
         toggleDialog(dialogRef, false);
         router.refresh();
      }

      return result;
   }, undefined);

   return (
      <>
         <button
            type="button"
            onClick={() => toggleDialog(dialogRef, true)}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition ${
               isCheckIn
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-amber-600 hover:bg-amber-500"
            }`}
         >
            {actionLabel} reservation
         </button>

         <Dialog
            title={`Confirm ${actionLabel.toLowerCase()}`}
            dialogRef={dialogRef}
            onClose={() => toggleDialog(dialogRef, false)}
         >
            <form action={formAction} className="grid gap-5 p-5">
               <p className="text-sm leading-6 text-gray-700">
                  Are you sure you want to {actionLabel.toLowerCase()} this
                  reservation?
               </p>
               <div className="flex justify-end gap-3">
                  <button
                     type="button"
                     onClick={() => toggleDialog(dialogRef, false)}
                     className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isPending}
                     className={`rounded-md px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        isCheckIn
                           ? "bg-emerald-600 hover:bg-emerald-500"
                           : "bg-amber-600 hover:bg-amber-500"
                     }`}
                  >
                     {isPending ? "Processing..." : `Confirm ${actionLabel}`}
                  </button>
               </div>
            </form>
         </Dialog>
      </>
   );
}
