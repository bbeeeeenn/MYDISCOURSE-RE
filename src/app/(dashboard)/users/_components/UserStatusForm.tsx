"use client";

import setUserStatus from "@/actions/users/setStatus";
import clsx from "clsx";
import { Ban, CheckCircle2, LoaderCircle } from "lucide-react";
import { SubmitEvent, useActionState } from "react";
import { toast } from "react-toastify";

export default function UserStatusForm({
   userId,
   disabled,
}: {
   userId: string;
   disabled: boolean;
}) {
   const nextStatus = disabled ? "ACTIVE" : "DISABLED";
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await setUserStatus(
            userId,
            String(formData.get("status")) as "ACTIVE" | "DISABLED",
         );
         toast(result.ok ? result.data.message : result.message, {
            type: result.ok ? "success" : "error",
            position: "bottom-right",
         });
         return result;
      },
      undefined,
   );

   const preventWhilePending = (event: SubmitEvent<HTMLFormElement>) => {
      if (isPending) event.preventDefault();
      if (
         !isPending &&
         nextStatus === "DISABLED" &&
         !window.confirm(
            "Disable this account? The user will no longer be able to sign in.",
         )
      ) {
         event.preventDefault();
      }
   };

   return (
      <form action={formAction} onSubmit={preventWhilePending}>
         <input type="hidden" name="status" value={nextStatus} />
         {state && !state.ok && (
            <p className="mb-2 text-xs text-red-700" role="alert">
               {state.message}
            </p>
         )}
         <button
            type="submit"
            disabled={isPending}
            className={clsx(
               "flex items-center gap-1 font-medium hover:text-gray-900",
               disabled ? "text-green-700" : "text-red-700",
               isPending && "opacity-75",
            )}
         >
            {isPending ? (
               <LoaderCircle size={15} className="animate-spin" />
            ) : disabled ? (
               <CheckCircle2 size={15} />
            ) : (
               <Ban size={15} />
            )}
            {isPending
               ? "Saving"
               : disabled
                 ? "Restore account"
                 : "Disable account"}
         </button>
      </form>
   );
}
