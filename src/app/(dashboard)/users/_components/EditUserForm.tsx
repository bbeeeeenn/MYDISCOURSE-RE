"use client";

import updateUser from "@/actions/users/update";
import { Role } from "@/generated/prisma/enums";
import clsx from "clsx";
import { LoaderCircle, Pencil } from "lucide-react";
import { SubmitEvent, useActionState } from "react";
import { toast } from "react-toastify";

export default function EditUserForm({
   user,
}: {
   user: {
      id: string;
      name: string | null;
      email: string | null;
      role: Role;
   };
}) {
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await updateUser(user.id, formData);
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
            <Pencil size={15} />
            Edit
         </summary>
         <form
            action={formAction}
            onSubmit={preventWhilePending}
            className="mt-3 grid min-w-64 gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
         >
            <label className="grid gap-1 text-xs font-medium text-gray-700">
               Name
               <input
                  name="name"
                  type="text"
                  defaultValue={user.name ?? ""}
                  required
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm font-normal"
               />
            </label>
            <label className="grid gap-1 text-xs font-medium text-gray-700">
               Email
               <input
                  name="email"
                  type="email"
                  defaultValue={user.email ?? ""}
                  required
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm font-normal"
               />
            </label>
            <label className="grid gap-1 text-xs font-medium text-gray-700">
               Role
               <select
                  name="role"
                  defaultValue={user.role}
                  className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm font-normal"
               >
                  <option value={Role.STUDENT}>Student</option>
                  <option value={Role.STAFF}>Staff</option>
                  <option value={Role.ADMIN}>Admin</option>
               </select>
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
               {isPending ? "Saving" : "Save changes"}
            </button>
         </form>
      </details>
   );
}
