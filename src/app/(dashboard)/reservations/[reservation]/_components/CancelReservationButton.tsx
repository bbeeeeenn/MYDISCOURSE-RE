"use client";

import adminDeleteReservation from "@/actions/reservations/adminDelete";
import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { reservationsPage } from "@/constants";
import { useRouter } from "next/navigation";
import { useActionState, useRef } from "react";
import { toast } from "react-toastify";

export default function CancelReservationButton({
   reservationId,
}: {
   reservationId: string;
}) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const router = useRouter();
   const [, formAction, isPending] = useActionState(async () => {
      const result = await adminDeleteReservation(reservationId);
      toast(result.ok ? result.data.message : result.message, {
         type: result.ok ? "success" : "error",
         position: "bottom-right",
      });

      if (result.ok) {
         toggleDialog(dialogRef, false);
         router.push(reservationsPage);
      }

      return result;
   }, undefined);

   return (
      <>
         <button
            type="button"
            onClick={() => toggleDialog(dialogRef, true)}
            className="w-full rounded-md border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
         >
            Cancel reservation
         </button>

         <Dialog
            title="Cancel reservation?"
            dialogRef={dialogRef}
            onClose={() => toggleDialog(dialogRef, false)}
         >
            <form action={formAction} className="grid gap-5 p-5">
               <p className="text-sm leading-6 text-gray-700">
                  This will permanently remove the reservation. This action
                  cannot be undone.
               </p>
               <div className="flex justify-end gap-3">
                  <button
                     type="button"
                     onClick={() => toggleDialog(dialogRef, false)}
                     className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                     Keep reservation
                  </button>
                  <button
                     type="submit"
                     disabled={isPending}
                     className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {isPending ? "Cancelling..." : "Confirm cancellation"}
                  </button>
               </div>
            </form>
         </Dialog>
      </>
   );
}
