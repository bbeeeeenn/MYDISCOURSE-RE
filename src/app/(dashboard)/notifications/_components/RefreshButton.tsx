"use client";

import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RefreshButton() {
   const router = useRouter();
   const [refreshing, startRefreshing] = useTransition();

   return (
      <button
         onClick={() => startRefreshing(() => router.refresh())}
         className="mb-4 ml-auto flex items-center justify-center gap-1 rounded-full border border-gray-300 bg-white px-4 py-1 text-sm"
      >
         <span>
            <RefreshCw
               size={16}
               className={clsx(refreshing && "animate-spin")}
            />
         </span>{" "}
         Refresh
      </button>
   );
}
