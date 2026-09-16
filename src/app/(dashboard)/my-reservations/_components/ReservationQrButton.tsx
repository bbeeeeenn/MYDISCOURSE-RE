"use client";

import { Dialog, toggleDialog } from "@/components/ui/Dialog";
import { Copy, QrCode } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { toast } from "react-toastify";

export default function ReservationQrButton({
   reservationId,
}: {
   reservationId: string;
}) {
   const dialogRef = useRef<HTMLDialogElement>(null);
   const [qrCode, setQrCode] = useState<string>();
   const reservationPath = `/reservations/${reservationId}`;
   const origin = useSyncExternalStore(
      () => () => {},
      () => window.location.origin,
      () => "",
   );
   const reservationUrl = origin
      ? `${origin}${reservationPath}`
      : reservationPath;

   useEffect(() => {
      let active = true;

      QRCode.toDataURL(reservationUrl, {
         errorCorrectionLevel: "M",
         margin: 2,
         width: 320,
      }).then((dataUrl) => {
         if (active) setQrCode(dataUrl);
      });

      return () => {
         active = false;
      };
   }, [reservationUrl]);

   return (
      <>
         <button
            type="button"
            onClick={() => toggleDialog(dialogRef, true)}
            className="text-base-300 mr-auto flex items-center gap-1.5 text-sm font-semibold transition hover:brightness-125"
         >
            <QrCode size={16} />
            Show QR code
         </button>

         <Dialog
            title="Reservation QR code"
            dialogRef={dialogRef}
            onClose={() => toggleDialog(dialogRef, false)}
         >
            <div className="grid justify-items-center gap-4 p-5">
               <p className="max-w-md text-center text-sm leading-6 text-gray-700">
                  Present this QR code to staff as a reference for your
                  reservation.
               </p>
               {qrCode ? (
                  <Image
                     src={qrCode}
                     alt="QR code for this reservation"
                     width={320}
                     height={320}
                     className="size-64 rounded-md bg-white p-2 sm:size-80"
                  />
               ) : (
                  <div className="flex size-64 items-center justify-center rounded-md bg-white text-sm text-gray-500 sm:size-80">
                     Generating QR code...
                  </div>
               )}
               <p
                  onClick={async () => {
                     await navigator.clipboard.writeText(reservationUrl);
                     toast.info("Copied to clipboard");
                  }}
                  className="flex max-w-full cursor-pointer items-center justify-center gap-1 text-center text-xs break-all text-gray-500 hover:underline"
               >
                  {reservationUrl}
                  <span>
                     <Copy size={14} />
                  </span>
               </p>
            </div>
         </Dialog>
      </>
   );
}
