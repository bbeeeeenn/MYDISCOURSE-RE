import { studentRecordsPage, studentRecordsPageSize } from "@/constants";
import { getStudentRecords } from "@/data-access-layer/student-records/allStudentRecords";
import restrict from "@/lib/restrict";
import { Suspense } from "react";
import ImportStudentRecords from "./_components/ImportStudentRecords";
import StudentRecordDirectory from "./_components/StudentRecordDirectory";
import StudentRecordFilters from "./_components/StudentRecordFilters";

type StudentRecordsSearchParams = {
   page?: string | string[];
   search?: string | string[];
};

function parsePage(value: string | string[] | undefined) {
   if (typeof value !== "string") return 1;
   const page = Number.parseInt(value, 10);
   return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

async function StudentRecordsContent({
   searchParams,
}: {
   searchParams: Promise<StudentRecordsSearchParams>;
}) {
   await restrict(["ADMIN"], studentRecordsPage);

   const params = await searchParams;
   const page = parsePage(params.page);
   const search = typeof params.search === "string" ? params.search.trim() : "";
   const { records, total } = await getStudentRecords({
      page,
      pageSize: studentRecordsPageSize,
      search,
   });

   return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <header className="mx-auto max-w-6xl">
            <h1 className="text-base-400 text-3xl font-bold">Student Records</h1>
            <p className="mt-1 text-gray-600">
               Browse student information by name, ID number, college, or program.
            </p>
         </header>
         <main className="mx-auto mt-8 grid max-w-6xl gap-4">
            <ImportStudentRecords />
            <StudentRecordFilters search={search} />
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold">All student records</h2>
               <span className="text-sm text-gray-500">
                  {total} {total === 1 ? "record" : "records"}
               </span>
            </div>
            <StudentRecordDirectory
               records={records}
               page={page}
               total={total}
               search={search}
            />
         </main>
      </div>
   );
}

function StudentRecordsFallback() {
   return (
      <div
         className="min-h-[calc(100vh-3.5rem)] animate-pulse bg-gray-50 p-4 pb-12 sm:p-8"
         aria-busy="true"
      >
         <div className="mx-auto max-w-6xl">
            <div className="h-9 w-64 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-96 max-w-full rounded bg-gray-200" />
            <div className="mt-8 h-20 rounded-lg bg-gray-200" />
            <div className="mt-4 h-96 rounded-lg bg-gray-200" />
         </div>
      </div>
   );
}

export default function StudentRecordsPage({
   searchParams,
}: {
   searchParams: Promise<StudentRecordsSearchParams>;
}) {
   return (
      <Suspense fallback={<StudentRecordsFallback />}>
         <StudentRecordsContent searchParams={searchParams} />
      </Suspense>
   );
}
