import { usersPage, usersPageSize } from "@/constants";
import { getUsers } from "@/data-access-layer/users/allUsers";
import { Role } from "@/generated/prisma/enums";
import restrict from "@/lib/restrict";
import { Suspense } from "react";
import UserDirectory from "./_components/UserDirectory";
import UserFilters from "./_components/UserFilters";
import CreateUserForm from "./_components/CreateUserForm";

type UserSearchParams = {
   page?: string;
   search?: string;
   role?: string;
   status?: string;
};

function parsePage(value: string | undefined) {
   const page = Number.parseInt(value ?? "1", 10);
   return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseRole(value: string | undefined) {
   return Object.values(Role).includes(value as Role)
      ? (value as Role)
      : undefined;
}

function parseStatus(value: string | undefined): "ACTIVE" | "DISABLED" {
   return value === "DISABLED" ? "DISABLED" : "ACTIVE";
}

async function UsersContent({
   searchParams,
}: {
   searchParams: Promise<UserSearchParams>;
}) {
   await restrict(["ADMIN"], usersPage);

   const params = await searchParams;
   const page = parsePage(params.page);
   const search = params.search?.trim() || undefined;
   const role = parseRole(params.role);
   const status = parseStatus(params.status);
   const { users, total } = await getUsers({
      page,
      pageSize: usersPageSize,
      search,
      role,
      status,
   });

   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <header className="mx-auto max-w-6xl">
            <h1 className="text-base-400 text-3xl font-bold">Users</h1>
            <p className="mt-1 text-gray-600">
               Manage user accounts, roles, and access.
            </p>
         </header>
         <main className="mx-auto mt-8 grid max-w-6xl gap-4">
            <CreateUserForm />
            <UserFilters search={search} role={role} status={status} />
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold">
                  {status === "DISABLED" ? "Disabled accounts" : "Active accounts"}
               </h2>
               <span className="text-sm text-gray-500">
                  {total} {total === 1 ? "account" : "accounts"}
               </span>
            </div>
            <UserDirectory
               users={users}
               page={page}
               total={total}
               search={search}
               role={role}
               status={status}
            />
         </main>
      </div>
   );
}

function UsersFallback() {
   return (
      <div
         className="min-h-[calc(100vh-3.5rem)] animate-pulse bg-gray-50 p-4 pb-12 sm:p-8"
         aria-busy="true"
      >
         <div className="mx-auto max-w-6xl">
            <div className="h-9 w-32 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
            <div className="mt-8 h-28 rounded-lg bg-gray-200" />
            <div className="mt-4 h-96 rounded-lg bg-gray-200" />
         </div>
      </div>
   );
}

export default function UsersPage({
   searchParams,
}: {
   searchParams: Promise<UserSearchParams>;
}) {
   return (
      <Suspense fallback={<UsersFallback />}>
         <UsersContent searchParams={searchParams} />
      </Suspense>
   );
}
