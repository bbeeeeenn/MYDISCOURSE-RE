import { studentRecordsPage, studentRecordsPageSize } from "@/constants";
import type { StudentRecordListItem } from "@/data-access-layer/student-records/allStudentRecords";
import Link from "next/link";

export default function StudentRecordDirectory({
   records,
   page,
   total,
   search,
}: {
   records: StudentRecordListItem[];
   page: number;
   total: number;
   search?: string;
}) {
   const totalPages = Math.ceil(total / studentRecordsPageSize);
   const query = new URLSearchParams();
   if (search) query.set("search", search);

   const hrefFor = (nextPage: number) => {
      const params = new URLSearchParams(query);
      params.set("page", String(nextPage));
      return `${studentRecordsPage}?${params.toString()}`;
   };

   if (records.length === 0) {
      return (
         <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="font-medium">
               {search ? "No student records found" : "No student records yet"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
               {search
                  ? "Try changing your search."
                  : "Student records will appear here once they are added."}
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
                        <th scope="col" className="px-4 py-3 font-semibold">
                           ID number
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Student
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Year level
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           College
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                           Program
                        </th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 select-text">
                     {records.map((record) => (
                        <tr key={record.id_number}>
                           <td className="px-4 py-4 font-medium whitespace-nowrap text-gray-900">
                              {record.id_number}
                           </td>
                           <td className="px-4 py-4 font-semibold text-gray-900">
                              {[
                                 record.firstname,
                                 record.middlename,
                                 record.lastname,
                              ]
                                 .filter(Boolean)
                                 .join(" ")}
                           </td>
                           <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                              Year {record.yearlevel}
                           </td>
                           <td className="px-4 py-4 text-gray-700">
                              {record.college}
                           </td>
                           <td className="px-4 py-4 text-gray-700">
                              {record.program}
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
               aria-label="Student records pagination"
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
