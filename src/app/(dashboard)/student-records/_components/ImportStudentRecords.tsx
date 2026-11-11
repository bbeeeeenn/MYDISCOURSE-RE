"use client";

import importStudentRecords from "@/actions/student-records/import";
import clsx from "clsx";
import { FileUp, LoaderCircle } from "lucide-react";
import { SubmitEvent, useActionState, useRef } from "react";
import { toast } from "react-toastify";

export default function ImportStudentRecords() {
   const formRef = useRef<HTMLFormElement>(null);
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await importStudentRecords(formData);
         toast(result.ok ? result.data.message : result.message, {
            type: result.ok ? "success" : "error",
            position: "bottom-right",
         });
         if (result.ok) formRef.current?.reset();
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
            <FileUp size={19} />
            Import student records
         </summary>
         <form
            ref={formRef}
            action={formAction}
            onSubmit={preventWhilePending}
            className="grid gap-4 border-t border-gray-200 p-4"
         >
            <div className="text-sm text-gray-600">
               <p>
                  Upload an .xlsx workbook with these column headers:{" "}
                  <span className="font-medium text-gray-800">
                     id_number, firstname, lastname, yearlevel, college, program
                  </span>
                  . The{" "}
                  <span className="font-medium text-gray-800">middlename</span>{" "}
                  column is optional. Existing ID numbers are updated with the
                  imported details; new IDs are added.
               </p>
               <p className="mt-1">
                  Maximum file size: 5 MB; maximum records: 20,000.
               </p>
            </div>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               XLSX workbook
               <input
                  type="file"
                  name="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  required
                  className="w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm font-normal file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:font-medium file:text-gray-700"
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
                  "bg-base-300 text-base-100 flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition hover:brightness-110 disabled:opacity-75",
                  isPending && "opacity-75",
               )}
            >
               {isPending && (
                  <LoaderCircle size={18} className="animate-spin" />
               )}
               {isPending ? "Importing records" : "Import XLSX"}
            </button>
         </form>
      </details>
   );
}
