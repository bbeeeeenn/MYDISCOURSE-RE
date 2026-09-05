"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

export function toggleDialog(
   dialogRef: { current: HTMLDialogElement | null },
   state?: boolean,
) {
   const dialog = dialogRef.current;
   if (!dialog) return;

   if (state === undefined) {
      state = !dialog.open;
   }

   if (state) dialog.showModal();
   else dialog.close();
}

export function Dialog({
   dialogRef,
   title,
   onClose,
   children,
}: {
   dialogRef: { current: HTMLDialogElement | null };
   title: string;
   onClose: () => void;
   children: ReactNode;
}) {
   return (
      <dialog
         ref={dialogRef}
         onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
         }}
         className="m-auto w-[calc(100%-16px)] max-w-150 rounded-md bg-gray-50 shadow-lg outline-none select-none"
      >
         <div className="flex justify-between border-b-4 border-b-amber-500 bg-[#d9d9d9] p-3 font-bold text-black/75">
            {title}
            <button onClick={onClose}>
               <X />
            </button>
         </div>
         {children}
      </dialog>
   );
}
