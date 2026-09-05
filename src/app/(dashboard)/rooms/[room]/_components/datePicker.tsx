"use client";

import clsx from "clsx";
import { addDays, format, parseISO } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { getPhilippineToday } from "@/lib/date";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
   "Jan",
   "Feb",
   "Mar",
   "Apr",
   "May",
   "Jun",
   "Jul",
   "Aug",
   "Sep",
   "Oct",
   "Nov",
   "Dec",
];

export default function DatePicker({ dateParam }: { dateParam?: string }) {
   const router = useRouter();
   const pathname = usePathname();
   const [isNavigating, startNavigating] = useTransition();

   const rootContainer = useRef<HTMLDivElement>(null);
   const sentinel = useRef<HTMLDivElement>(null);
   const selectedDate = dateParam
      ? parseISO(dateParam)
      : parseISO(getPhilippineToday());

   const dateNow = parseISO(getPhilippineToday());
   const [dates, setDates] = useState([
      dateNow.getDay() === 0 ? addDays(dateNow, 1) : dateNow,
   ]);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([hit]) => {
            if (hit.isIntersecting) {
               setDates((prev) => {
                  const currDate = prev[prev.length - 1];
                  const newDates = [];

                  // Populate newDates
                  for (let i = 1; i <= 30; i++) {
                     const newDate = addDays(currDate, i);
                     if (newDate.getDay() === 0) continue;
                     newDates.push(newDate);
                  }
                  return [...prev, ...newDates];
               });
            }
         },
         {
            root: rootContainer.current,
         },
      );
      if (sentinel.current) observer.observe(sentinel.current);

      return () => observer.disconnect();
   }, []);

   return (
      <div
         ref={rootContainer}
         className={clsx(
            "flex w-full gap-2 overflow-x-auto p-4",
            isNavigating && "pointer-events-none overflow-x-hidden opacity-50",
         )}
      >
         {dates.map((date) => (
            <DateCard
               onClick={() => {
                  if (!isNavigating)
                     startNavigating(() =>
                        router.replace(
                           `${pathname}?date=${format(date, "yyyy-MM-dd")}`,
                        ),
                     );
               }}
               key={format(date, "yyyy-MM-dd")}
               date={date}
               active={date.getTime() === selectedDate.getTime()}
            />
         ))}
         <div ref={sentinel} className="min-w-20" />
      </div>
   );
}

function DateCard({
   date,
   active,
   onClick,
}: {
   date: Date;
   active: boolean;
   onClick: () => void;
}) {
   const formatted = format(date, "yyyy-MM-dd");
   const isToday = formatted === getPhilippineToday();
   return (
      <button
         onClick={onClick}
         tabIndex={-1}
         className={clsx(
            "flex min-w-20 flex-col items-center rounded-lg p-2 text-sm font-medium",
            active
               ? "bg-base-200 text-base-100 pointer-events-none"
               : "bg-gray-200",
         )}
      >
         <span className="text-xs font-semibold tracking-wide uppercase opacity-70">
            {isToday ? "Today" : daysOfWeek[date.getDay()]}
         </span>
         <span className="text-2xl leading-tight font-bold">
            {date.getDate()}
         </span>
         <span className="text-xs font-medium opacity-70">
            {months[date.getMonth()]}
         </span>
      </button>
   );
}
