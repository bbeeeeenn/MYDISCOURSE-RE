"use client";

import createUser from "@/actions/users/create";
import { Role } from "@/generated/prisma/enums";
import clsx from "clsx";
import { LoaderCircle, UserPlus } from "lucide-react";
import { SubmitEvent, useActionState } from "react";
import { toast } from "react-toastify";

export default function CreateUserForm() {
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await createUser(formData);
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
      <details className="rounded-lg border border-gray-200 bg-white shadow-sm">
         <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold text-gray-800">
            <UserPlus size={19} />
            Create account
         </summary>
         <form
            action={formAction}
            onSubmit={preventWhilePending}
            className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2"
         >
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Name
               <input
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="h-10 rounded-md border border-gray-300 px-3 font-normal"
               />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Email
               <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-10 rounded-md border border-gray-300 px-3 font-normal"
               />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Role
               <select
                  name="role"
                  defaultValue={Role.STUDENT}
                  required
                  className="h-10 rounded-md border border-gray-300 bg-white px-3 font-normal"
               >
                  <option value={Role.STUDENT}>Student</option>
                  <option value={Role.STAFF}>Staff</option>
                  <option value={Role.ADMIN}>Admin</option>
               </select>
            </label>
            <div />
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Password
               <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="h-10 rounded-md border border-gray-300 px-3 font-normal"
               />
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Confirm password
               <input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="h-10 rounded-md border border-gray-300 px-3 font-normal"
               />
            </label>
            {state && !state.ok && (
               <p className="text-sm text-red-700 sm:col-span-2" role="alert">
                  {state.message}
               </p>
            )}
            <button
               type="submit"
               disabled={isPending}
               className={clsx(
                  "bg-base-300 text-base-100 flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition hover:brightness-110 sm:col-span-2",
                  isPending && "opacity-75",
               )}
            >
               {isPending && <LoaderCircle size={18} className="animate-spin" />}
               {isPending ? "Creating account" : "Create account"}
            </button>
         </form>
      </details>
   );
}
