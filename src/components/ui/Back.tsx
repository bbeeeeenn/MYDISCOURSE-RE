"use client";

import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Back({ path }: { path?: string }) {
   const router = useRouter();

   const handleBack = () => {
      const referrer = document.referrer;
      const hasSameOriginReferrer = referrer
         ? new URL(referrer).origin === window.location.origin
         : false;

      if (hasSameOriginReferrer) {
         router.back();
      } else if (path) {
         router.replace(path);
      } else {
         router.back();
      }
   };

   return (
      <button
         type="button"
         onClick={handleBack}
         className="flex items-center gap-1"
      >
         <span>
            <Undo2 size={20} />
         </span>
         <u>Back</u>
      </button>
   );
}
