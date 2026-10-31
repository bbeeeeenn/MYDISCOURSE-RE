"use client";
import { Dialog } from "@/components/ui/Dialog";
import { Scanner } from "@yudiel/react-qr-scanner";
import { isValid, parseISO } from "date-fns";
import { AlertCircle, CheckCircle2, QrCode } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type RoomOption = {
   id: string;
   room_name: string;
};

export default function ReservationFilters({
   rooms,
   pathname,
   roomId,
   date,
}: {
   rooms: RoomOption[];
   pathname: string;
   roomId?: string;
   date?: string;
}) {
   const selectedDate = date && isValid(parseISO(date)) ? date : "";

   return (
      <div className="mb-6">
         <form
            action={pathname}
            method="get"
            className="grid grow gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end"
         >
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Room
               <select
                  name="roomId"
                  defaultValue={roomId ?? ""}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 font-normal"
               >
                  <option value="">All rooms</option>
                  {rooms.map((room) => (
                     <option key={room.id} value={room.id}>
                        {room.room_name}
                     </option>
                  ))}
               </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-gray-700">
               Date
               <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 font-normal"
               />
            </label>
            <button
               type="submit"
               className="bg-base-300 text-base-100 h-10 rounded-md px-4 text-sm font-semibold transition hover:brightness-110"
            >
               Filter
            </button>
            <Link
               href={pathname}
               className="flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
               Clear
            </Link>
         </form>
         <ScanDialog />
      </div>
   );
}

function getReservationUrl(value: string) {
   try {
      const url = new URL(value);
      if (url.origin !== window.location.origin) return null;

      const match = url.pathname.match(/^\/reservations\/([^/]+)$/);
      if (!match || url.search || url.hash) return null;

      return url.pathname;
   } catch {
      return null;
   }
}

function ScanDialog() {
   const ref = useRef<HTMLDialogElement>(null);

   const router = useRouter();
   const [isPaused, setIsPaused] = useState(true);
   const [status, setStatus] = useState<"scanning" | "invalid" | "error">(
      "scanning",
   );

   function handleScan(detectedCodes: { rawValue: string }[]) {
      const reservationUrl = detectedCodes
         .map((code) => getReservationUrl(code.rawValue))
         .find((url): url is string => Boolean(url));

      if (reservationUrl) {
         setStatus("scanning");
         router.push(reservationUrl);
         return;
      }

      setStatus("invalid");
   }

   const openDialog = () => {
      setIsPaused(false);
      setStatus("scanning");
      ref.current?.showModal();
   };
   const closeDialog = () => {
      ref.current?.close();
      setIsPaused(true);
   };
   return (
      <>
         <button
            onClick={openDialog}
            className="mt-4 flex w-full items-center justify-center gap-x-2 rounded-lg border border-gray-200 bg-white p-2 text-lg shadow-sm"
         >
            <span>
               <QrCode size={20} />
            </span>
            Scan
         </button>
         <Dialog title="Scan" onClose={closeDialog} dialogRef={ref}>
            <section className="overflow-hidden shadow-sm">
               <div className="p-4 sm:p-6">
                  <div className="mx-auto max-w-100 overflow-hidden rounded-lg bg-gray-950">
                     <Scanner
                        paused={isPaused}
                        onScan={handleScan}
                        onError={() => setStatus("error")}
                        allowMultiple
                        scanDelay={1000}
                        formats={["qr_code"]}
                        constraints={{ facingMode: "environment" }}
                        sound
                        classNames={{ container: "w-full", video: "w-full" }}
                     />
                  </div>

                  <div
                     aria-live="polite"
                     className={`mt-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                        status === "invalid"
                           ? "bg-orange-50 text-orange-800"
                           : status === "error"
                             ? "bg-red-50 text-red-800"
                             : "bg-green-50 text-green-800"
                     }`}
                  >
                     {status === "invalid" ? (
                        <AlertCircle className="mt-0.5 shrink-0" size={17} />
                     ) : status === "error" ? (
                        <AlertCircle className="mt-0.5 shrink-0" size={17} />
                     ) : (
                        <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
                     )}
                     <span>
                        {status === "invalid"
                           ? "That QR code is not a reservation from this app."
                           : status === "error"
                             ? "Camera access is unavailable. Check your browser permissions and try again."
                             : "Ready to scan a reservation QR code."}
                     </span>
                  </div>
               </div>
            </section>
         </Dialog>
      </>
   );
}
