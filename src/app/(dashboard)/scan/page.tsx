"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { AlertCircle, Camera, CheckCircle2, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function ScanPage() {
  const router = useRouter();
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

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-gray-50 p-4 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="text-base-400 mt-2 text-3xl font-bold">
            Scan reservation
          </h1>
          <p className="mt-2 max-w-lg text-gray-600">
            Point the camera at a reservation QR code to open its admin
            details.
          </p>
        </header>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="p-4 sm:p-6">
            <div className="overflow-hidden rounded-lg bg-gray-950">
              <Scanner
                onScan={handleScan}
                onError={() => setStatus("error")}
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
            </div></div>
        </section>
      </div>
    </main>
  );
}
