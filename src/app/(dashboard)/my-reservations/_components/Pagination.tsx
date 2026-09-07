import Link from "next/link";

export default function Pagination({
   page,
   total,
   param,
   pageSize,
}: {
   page: number;
   total: number;
   param: string;
   pageSize: number;
}) {
   const totalPages = Math.ceil(total / pageSize);
   if (totalPages <= 1) return null;

   const hrefFor = (nextPage: number) => `?${param}=${nextPage}`;

   return (
      <nav
         className="mt-4 flex items-center justify-between"
         aria-label={`${param} pagination`}
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
   );
}
