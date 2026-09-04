"use client";

import { createRoomPage } from "@/constants";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CreateButton() {
   const session = useSession();
   return (
      session.data?.user.role === "ADMIN" && (
         <div className="mt-2 mb-4">
            <Link
               href={createRoomPage}
               className="bg-base-200 text-base-100 flex w-fit items-center justify-center gap-0.5 rounded-md px-8 py-1.5 shadow-md"
            >
               <span>
                  <Plus />
               </span>
               Create Room
            </Link>
         </div>
      )
   );
}
