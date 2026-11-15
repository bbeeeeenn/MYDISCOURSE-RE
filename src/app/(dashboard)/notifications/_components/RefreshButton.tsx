"use client";

import clearMyNotifications from "@/actions/notifications/clearMyNotifications";
import clsx from "clsx";
import { Ellipsis, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function MoreActionButtons() {
   const router = useRouter();
   const [refreshing, startRefreshing] = useTransition();
   const [clearingNotif, startClearingNotif] = useTransition();
   const [optionsIsOpen, setOptionsIsOpen] = useState(false);

   const onClearNotif = () =>
      startClearingNotif(async () => {
         await clearMyNotifications();
      });

   return (
      <div className="relative mb-4 flex justify-end gap-1.5">
         <button
            onClick={() => startRefreshing(() => router.refresh())}
            className="flex items-center justify-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-1 text-sm"
         >
            <span>
               <RefreshCw
                  size={16}
                  className={clsx(refreshing && "animate-spin")}
               />
            </span>{" "}
            Refresh
         </button>
         <button
            onClick={() => setOptionsIsOpen((prev) => !prev)}
            className="flex items-center justify-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1 text-sm"
         >
            <Ellipsis size={16} />
         </button>
         {optionsIsOpen && (
            <div className="absolute top-[calc(100%+8px)] -right-1 rounded-md border border-gray-300 bg-white shadow-md">
               <button
                  onClick={onClearNotif}
                  disabled={clearingNotif}
                  className="flex w-fit items-center justify-center gap-1 px-4 py-2"
               >
                  <span>
                     {clearingNotif ? (
                        <LoaderCircle size={16} className="animate-spin" />
                     ) : (
                        <Trash2 size={16} />
                     )}
                  </span>
                  Clear Notifications
               </button>
            </div>
         )}
      </div>
   );
}
