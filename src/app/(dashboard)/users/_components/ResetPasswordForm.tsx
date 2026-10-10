"use client";

import resetUserPassword from "@/actions/users/resetPassword";
import clsx from "clsx";
import { KeyRound, LoaderCircle } from "lucide-react";
import { SubmitEvent, useActionState } from "react";
import { toast } from "react-toastify";

export default function ResetPasswordForm({ userId }: { userId: string }) {
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await resetUserPassword(userId, formData);
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
   };

   return (
      <details>
         <summary className="flex cursor-pointer items-center gap-1 font-medium text-gray-700 hover:text-gray-900">
            <KeyRound size={15} />
            Reset password
         </summary>
         <form
            action={formAction}
            onSubmit={preventWhilePending}
            className="mt-3 grid min-w-64 gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
         >
            <p className="text-xs text-gray-600">
               Set a new password for this account. The current password cannot
               be viewed.
            </p>
            <label className="grid gap-1 text-xs font-medium text-gray-700">
               New password
               <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm font-normal"
               />
            </label>
            <label className="grid gap-1 text-xs font-medium text-gray-700">
               Confirm new password
               <input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm font-normal"
               />
            </label>
            {state && !state.ok && (
               <p className="text-xs text-red-700" role="alert">
                  {state.message}
               </p>
            )}
            <button
               type="submit"
               disabled={isPending}
               className={clsx(
                  "bg-base-300 text-base-100 flex h-9 items-center justify-center gap-1 rounded-md px-3 text-xs font-semibold",
                  isPending && "opacity-75",
               )}
            >
               {isPending && <LoaderCircle size={14} className="animate-spin" />}
               {isPending ? "Resetting" : "Reset password"}
            </button>
         </form>
      </details>
   );
}
