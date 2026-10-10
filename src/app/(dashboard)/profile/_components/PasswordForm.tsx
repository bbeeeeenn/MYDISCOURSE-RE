"use client";

import updatePassword from "@/actions/profile/password";
import clsx from "clsx";
import { KeyRound, LoaderCircle } from "lucide-react";
import { SubmitEvent, useActionState } from "react";
import { toast } from "react-toastify";

export default function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await updatePassword(formData);
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
      <form
         action={formAction}
         onSubmit={preventWhilePending}
         className="mx-auto grid max-w-2xl gap-4 border-t border-gray-200 p-4"
      >
         <div>
            <h2 className="text-xl font-bold">
               {hasPassword ? "Change password" : "Set a password"}
            </h2>
            <p className="text-gray-600">
               {hasPassword
                  ? "Update the password used for email and password sign-in."
                  : "Set a password so you can also sign in with your email."}
            </p>
         </div>
         {hasPassword && (
            <label className="grid gap-1 text-gray-700" htmlFor="currentPassword">
               Current password
               <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="rounded-sm border-2 border-gray-500 p-2 text-lg"
               />
            </label>
         )}
         <label className="grid gap-1 text-gray-700" htmlFor="password">
            New password
            <input
               id="password"
               name="password"
               type="password"
               required
               minLength={8}
               autoComplete="new-password"
               className="rounded-sm border-2 border-gray-500 p-2 text-lg"
            />
         </label>
         <label className="grid gap-1 text-gray-700" htmlFor="confirmPassword">
            Confirm new password
            <input
               id="confirmPassword"
               name="confirmPassword"
               type="password"
               required
               minLength={8}
               autoComplete="new-password"
               className="rounded-sm border-2 border-gray-500 p-2 text-lg"
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
               "bg-base-200 text-base-100 flex items-center justify-center gap-2 rounded-md py-2 text-lg font-medium",
               isPending && "opacity-75",
            )}
         >
            {isPending ? (
               <LoaderCircle className="animate-spin" />
            ) : (
               <KeyRound />
            )}
            {isPending
               ? "Saving"
               : hasPassword
                 ? "Change password"
                 : "Set password"}
         </button>
      </form>
   );
}
