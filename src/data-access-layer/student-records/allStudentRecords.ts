import { studentRecordsPage } from "@/constants";
import { StudentRecordWhereInput } from "@/generated/prisma/models";
import prisma from "@/lib/prisma";
import restrict from "@/lib/restrict";

export type StudentRecordListItem = Awaited<
   ReturnType<typeof getStudentRecords>
>["records"][number];

export async function getStudentRecords({
   page,
   pageSize,
   search,
}: {
   page: number;
   pageSize: number;
   search?: string;
}) {
   await restrict(["ADMIN"], studentRecordsPage);

   const normalizedSearch = search?.trim();
   const searchAsYear = normalizedSearch
      ? Number(normalizedSearch)
      : Number.NaN;
   const where: StudentRecordWhereInput = normalizedSearch
      ? {
           OR: [
              {
                 id_number: { contains: normalizedSearch, mode: "insensitive" },
              },
              {
                 firstname: { contains: normalizedSearch, mode: "insensitive" },
              },
              {
                 middlename: {
                    contains: normalizedSearch,
                    mode: "insensitive",
                 },
              },
              { lastname: { contains: normalizedSearch, mode: "insensitive" } },
              { college: { contains: normalizedSearch, mode: "insensitive" } },
              { program: { contains: normalizedSearch, mode: "insensitive" } },
              ...(Number.isInteger(searchAsYear)
                 ? [{ yearlevel: searchAsYear }]
                 : []),
           ],
        }
      : {};

   const [records, total] = await Promise.all([
      prisma.studentRecord.findMany({
         where,
         select: {
            id_number: true,
            firstname: true,
            middlename: true,
            lastname: true,
            yearlevel: true,
            college: true,
            program: true,
         },
         orderBy: [
            { id_number: "asc" },
            { lastname: "asc" },
            { firstname: "asc" },
         ],
         skip: (page - 1) * pageSize,
         take: pageSize,
      }),
      prisma.studentRecord.count({ where }),
   ]);

   return { records, total };
}
