"use client";

import { roomsPage } from "@/constants";
import { Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function EditRoomButton({ roomId }: { roomId: string }) {
   const session = useSession();
   if (session.data?.user.role !== "ADMIN") return null;

   return (
      <Link
         href={`${roomsPage}/${roomId}/settings`}
         className="text-base-100 absolute top-3 right-3 z-100"
      >
         <Settings size={20} />
      </Link>
   );
}
