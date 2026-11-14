import { Suspense } from "react";
import { notificationsPageSize } from "@/constants";
import Pagination from "../my-reservations/_components/Pagination";
import { getMyNotifications } from "@/data-access-layer/notifications/myNotifications";
import NotificationCard from "./_components/NotificationCard";

function parsePage(value: string | undefined) {
   const page = Number.parseInt(value ?? "1", 10);
   return Number.isInteger(page) && page > 0 ? page : 1;
}

async function NotificationList({
   searchParams,
}: {
   searchParams: Promise<{ page?: string }>;
}) {
   const params = await searchParams;
   const { notifications, total, currentPage } = await getMyNotifications({
      page: parsePage(params.page),
      pageSize: notificationsPageSize,
   });

   return (
      <main className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 pb-12 sm:p-8">
         <div className="mx-auto max-w-5xl">
            <header className="mb-6 flex items-end justify-between gap-3">
               <h1 className="text-base-400 text-3xl font-bold">
                  Notifications
               </h1>
               <span className="text-sm text-gray-500">
                  {total} notifications
               </span>
            </header>

            {notifications.length > 0 ? (
               <div className="rounded-lg border border-gray-200 bg-white">
                  {notifications.map((item) => (
                     <NotificationCard key={item.id} item={item} />
                  ))}
               </div>
            ) : (
               <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
                  No notifications yet.
               </p>
            )}

            <Pagination
               page={currentPage}
               total={total}
               param="page"
               pageSize={notificationsPageSize}
            />
         </div>
      </main>
   );
}

export default function NotificationsPage({
   searchParams,
}: {
   searchParams: Promise<{ page?: string }>;
}) {
   return (
      <Suspense
         fallback={
            <main className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 sm:p-8">
               <div className="mx-auto max-w-5xl animate-pulse">
                  <div className="h-9 w-52 rounded bg-gray-200" />
                  <div className="mt-6 h-24 rounded-lg bg-gray-200" />
               </div>
            </main>
         }
      >
         <NotificationList searchParams={searchParams} />
      </Suspense>
   );
}
