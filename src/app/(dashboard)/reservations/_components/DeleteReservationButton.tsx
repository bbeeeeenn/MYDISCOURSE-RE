"use client";

import adminDeleteReservation from "@/actions/reservations/adminDelete";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useActionState } from "react";
import { toast } from "react-toastify";

export default function DeleteReservationButton({
   reservationId,
}: {
   reservationId: string;
}) {
   const onDelete = async () => {
      if (!window.confirm("Delete this reservation?")) return;

      const result = await adminDeleteReservation(reservationId);
      toast(result.ok ? result.data.message : result.message, {
         type: result.ok ? "success" : "error",
         position: "bottom-right",
      });
      return result;
   };
   const [, deleteAction, isPending] = useActionState(onDelete, undefined);

   return (
      <form action={deleteAction}>
         <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-700 transition hover:text-red-900 disabled:cursor-wait disabled:opacity-50"
         >
            {isPending ? (
               <LoaderCircle className="animate-spin" size={16} />
            ) : (
               <Trash2 size={16} />
            )}
            {isPending ? "Cancelling..." : "Cancel reservation"}
         </button>
      </form>
   );
}
