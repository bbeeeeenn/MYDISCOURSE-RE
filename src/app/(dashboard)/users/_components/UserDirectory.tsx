import { usersPageSize, usersPage } from "@/constants";
import type { UserListItem } from "@/data-access-layer/users/allUsers";
import Link from "next/link";
import EditUserForm from "./EditUserForm";
import ResetPasswordForm from "./ResetPasswordForm";
import UserStatusForm from "./UserStatusForm";

export default function UserDirectory({
   users,
   page,
   total,
   search,
   role,
   status,
}: {
   users: UserListItem[];
   page: number;
   total: number;
   search?: string;
   role?: string;
   status: "ACTIVE" | "DISABLED";
}) {
   const totalPages = Math.ceil(total / usersPageSize);
   const query = new URLSearchParams();
   if (search) query.set("search", search);
   if (role) query.set("role", role);
   query.set("status", status);

   const hrefFor = (nextPage: number) => {
      const params = new URLSearchParams(query);
      params.set("page", String(nextPage));
      return `${usersPage}?${params.toString()}`;
   };

   if (users.length === 0) {
      return (
         <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-medium">No users found</p>
            <p className="mt-1 text-sm text-gray-500">
               Try changing your search or filters.
            </p>
         </div>
      );
   }

   return (
      <>
         <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
               <table className="w-full min-w-190 text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-600 uppercase">
                     <tr>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">
                           Upcoming reservations
                        </th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {users.map((user) => (
                        <tr key={user.id} className="align-top">
                           <td className="px-4 py-4">
                              <p className="font-semibold text-gray-900">
                                 {user.name ?? "Unnamed user"}
                              </p>
                              <p className="mt-1 text-gray-500">
                                 {user.email ?? "No email"}
                              </p>
                           </td>
                           <td className="px-4 py-4">
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                 {user.role}
                              </span>
                           </td>
                           <td className="px-4 py-4">
                              <span
                                 className={
                                    user.disabledAt
                                       ? "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700"
                                       : "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700"
                                 }
                              >
                                 {user.disabledAt ? "Disabled" : "Active"}
                              </span>
                           </td>
                           <td className="px-4 py-4 text-gray-700">
                              {user._count.reservations}
                           </td>
                           <td className="px-4 py-4 text-gray-500">
                              <div className="grid gap-3">
                                 <EditUserForm
                                    user={{
                                       id: user.id,
                                       name: user.name,
                                       email: user.email,
                                       role: user.role,
                                    }}
                                 />
                                 <ResetPasswordForm userId={user.id} />
                                 <UserStatusForm
                                    userId={user.id}
                                    disabled={Boolean(user.disabledAt)}
                                 />
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
         {totalPages > 1 && (
            <nav
               className="mt-4 flex items-center justify-between"
               aria-label="Users pagination"
            >
               {page > 1 ? (
                  <Link
                     href={hrefFor(page - 1)}
                     className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                     Previous
                  </Link>
               ) : (
                  <span />
               )}
               <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
               </span>
               {page < totalPages ? (
                  <Link
                     href={hrefFor(page + 1)}
                     className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                     Next
                  </Link>
               ) : (
                  <span />
               )}
            </nav>
         )}
      </>
   );
}
