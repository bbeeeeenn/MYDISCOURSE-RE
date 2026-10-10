import { usersPage } from "@/constants";
import { UserWhereInput } from "@/generated/prisma/models";
import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import restrict from "@/lib/restrict";

export type UserStatus = "ACTIVE" | "DISABLED";
export type UserListItem = Awaited<ReturnType<typeof getUsers>>["users"][number];

export async function getUsers({
   page,
   pageSize,
   search,
   role,
   status = "ACTIVE",
}: {
   page: number;
   pageSize: number;
   search?: string;
   role?: Role;
   status?: UserStatus;
}) {
   await restrict(["ADMIN"], usersPage);

   const normalizedSearch = search?.trim();
   const where: UserWhereInput = {
      ...(normalizedSearch
         ? {
              OR: [
                 {
                    name: {
                       contains: normalizedSearch,
                       mode: "insensitive",
                    },
                 },
                 {
                    email: {
                       contains: normalizedSearch,
                       mode: "insensitive",
                    },
                 },
              ],
           }
         : {}),
      ...(role ? { role } : {}),
      disabledAt: status === "DISABLED" ? { not: null } : null,
   };

   const [users, total] = await Promise.all([
      prisma.user.findMany({
         where,
         select: {
            id: true,
            name: true,
            email: true,
            role: true,
            disabledAt: true,
            _count: {
               select: {
                  reservations: {
                     where: {
                        endTime: { gt: new Date() },
                        checkedOutAt: null,
                     },
                  },
               },
            },
         },
         orderBy: [{ name: { sort: "asc", nulls: "last" } }, { id: "asc" }],
         skip: (page - 1) * pageSize,
         take: pageSize,
      }),
      prisma.user.count({ where }),
   ]);

   return { users, total };
}
