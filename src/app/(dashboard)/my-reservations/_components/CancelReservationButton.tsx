"use client";

import cancelReservation from "@/actions/reservations/cancel";
import { LoaderCircle, X } from "lucide-react";
import { useActionState } from "react";
import { toast } from "react-toastify";

export default function CancelReservationButton({
   reservationId,
}: {
   reservationId: string;
}) {
   const onCancel = async () => {
      if (!window.confirm("Cancel this reservation?")) return;

      const result = await cancelReservation(reservationId);
      toast(result.ok ? result.data.message : result.message, {
         type: result.ok ? "success" : "error",
         position: "bottom-right",
      });
      return result;
   };
   const [, cancelAction, isPending] = useActionState(onCancel, undefined);

   return (
      <form action={cancelAction}>
         <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-700 transition hover:text-red-900 disabled:cursor-wait disabled:opacity-50"
         >
            {isPending ? (
               <LoaderCircle className="animate-spin" size={16} />
            ) : (
               <X size={16} />
            )}
            {isPending ? "Cancelling..." : "Cancel reservation"}
         </button>
      </form>
   );
}
