import { studentRecordsPage } from "@/constants";
import Link from "next/link";

export default function StudentRecordFilters({ search }: { search?: string }) {
   return (
      <form
         action={studentRecordsPage}
         method="get"
         className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end"
      >
         <label className="grid gap-1 text-sm font-medium text-gray-700">
            Search student records
            <input
               type="search"
               name="search"
               defaultValue={search ?? ""}
               placeholder="Name, ID number, college, or program"
               className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 font-normal"
            />
         </label>
         <button
            type="submit"
            className="bg-base-300 text-base-100 h-10 rounded-md px-4 text-sm font-semibold transition hover:brightness-110"
         >
            Search
         </button>
         <Link
            href={studentRecordsPage}
            className="flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
         >
            Clear
         </Link>
      </form>
   );
}
