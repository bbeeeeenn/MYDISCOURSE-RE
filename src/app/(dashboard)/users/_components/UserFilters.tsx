import { usersPage } from "@/constants";
import { Role } from "@/generated/prisma/enums";
import Link from "next/link";

export default function UserFilters({
   search,
   role,
   status,
}: {
   search?: string;
   role?: Role;
   status: "ACTIVE" | "DISABLED";
}) {
   return (
      <form
         action={usersPage}
         method="get"
         className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_12rem_12rem_auto_auto] sm:items-end"
      >
         <label className="grid gap-1 text-sm font-medium text-gray-700">
            Search
            <input
               type="search"
               name="search"
               defaultValue={search ?? ""}
               placeholder="Name or email"
               className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 font-normal"
            />
         </label>
         <label className="grid gap-1 text-sm font-medium text-gray-700">
            Role
            <select
               name="role"
               defaultValue={role ?? ""}
               className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 font-normal"
            >
               <option value="">All roles</option>
               <option value={Role.ADMIN}>Admin</option>
               <option value={Role.STAFF}>Staff</option>
               <option value={Role.STUDENT}>Student</option>
            </select>
         </label>
         <label className="grid gap-1 text-sm font-medium text-gray-700">
            Status
            <select
               name="status"
               defaultValue={status}
               className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 font-normal"
            >
               <option value="ACTIVE">Active</option>
               <option value="DISABLED">Disabled</option>
            </select>
         </label>
         <button
            type="submit"
            className="bg-base-300 text-base-100 h-10 rounded-md px-4 text-sm font-semibold transition hover:brightness-110"
         >
            Filter
         </button>
         <Link
            href={usersPage}
            className="flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
         >
            Clear
         </Link>
      </form>
   );
}
