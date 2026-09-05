"use client";

import updateProfile from "@/actions/profile/update";
import clsx from "clsx";
import { LoaderCircle, Save } from "lucide-react";
import { SubmitEvent, useActionState } from "react";
import { toast } from "react-toastify";

type Profile = {
   name: string | null;
   email: string | null;
   id_number: string | null;
   year_level: number | null;
   course: string | null;
   role: "ADMIN" | "STAFF" | "STUDENT";
};

export default function ProfileForm({ user }: { user: Profile }) {
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await updateProfile(formData);
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
         className="mx-auto grid max-w-2xl gap-4 p-4"
      >
         <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-gray-600">
               Keep your account information up to date.
            </p>
         </div>
         <label className="grid gap-1 text-gray-700" htmlFor="name">
            Name
            <input
               id="name"
               name="name"
               type="text"
               defaultValue={user.name ?? ""}
               required
               autoComplete="name"
               spellCheck={false}
               className="rounded-sm border-2 border-gray-500 p-2 text-lg"
            />
         </label>
         <label className="grid gap-1 text-gray-700" htmlFor="email">
            Email
            <input
               id="email"
               type="email"
               value={user.email ?? ""}
               spellCheck={false}
               readOnly
               className="rounded-sm border-2 border-gray-300 bg-gray-100 p-2 text-lg"
            />
         </label>
         <label className="grid gap-1 text-gray-700" htmlFor="id-number">
            ID number
            <input
               id="id-number"
               name="idNumber"
               type="text"
               defaultValue={user.id_number ?? ""}
               spellCheck={false}
               autoComplete="off"
               className="rounded-sm border-2 border-gray-500 p-2 text-lg"
            />
         </label>
         <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-gray-700" htmlFor="year-level">
               Year level
               <input
                  id="year-level"
                  name="yearLevel"
                  type="number"
                  spellCheck={false}
                  min={1}
                  defaultValue={user.year_level ?? ""}
                  className="rounded-sm border-2 border-gray-500 p-2 text-lg"
               />
            </label>
            <label className="grid gap-1 text-gray-700" htmlFor="course">
               Course
               <input
                  id="course"
                  name="course"
                  spellCheck={false}
                  type="text"
                  defaultValue={user.course ?? ""}
                  className="rounded-sm border-2 border-gray-500 p-2 text-lg"
               />
            </label>
         </div>
         <p className="text-sm text-gray-600">Account role: {user.role}</p>
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
            {isPending ? <LoaderCircle className="animate-spin" /> : <Save />}
            {isPending ? "Saving" : "Save changes"}
         </button>
      </form>
   );
}
