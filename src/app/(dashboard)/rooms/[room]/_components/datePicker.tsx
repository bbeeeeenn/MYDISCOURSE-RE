"use client";

import clsx from "clsx";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
   const rootContainer = useRef<HTMLDivElement>(null);
   const sentinel = useRef<HTMLDivElement>(null);
   const selectedDate = dateParam
      ? parseISO(dateParam)
      : startOfDay(new Date());

   const [dates, setDates] = useState([startOfDay(new Date())]);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([hit]) => {
            if (hit.isIntersecting) {
               setDates((prev) => {
                  const currDate = prev[prev.length - 1];
                  const newDates = [];
                  for (let i = 1; i <= 30; i++) {
                     newDates.push(addDays(currDate, i));
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
         className="flex w-full gap-2 overflow-x-auto p-4"
      >
         {dates.map((date) => (
            <DateCard
               key={format(date, "yyyy-MM-dd")}
               date={date}
               active={date.getTime() === selectedDate.getTime()}
            />
         ))}
         <div ref={sentinel} className="min-w-20" />
      </div>
   );
}

function DateCard({ date, active }: { date: Date; active: boolean }) {
   const pathname = usePathname();
   const formatted = format(date, "yyyy-MM-dd");
   return (
      <Link
         href={`${pathname}?date=${formatted}`}
         tabIndex={-1}
         className={clsx(
            "flex min-w-20 flex-col items-center rounded-lg p-2 text-sm font-medium",
            active
               ? "bg-base-200 text-base-100 pointer-events-none"
               : "bg-gray-200",
         )}
      >
         {formatted === format(startOfDay(new Date()), "yyyy-MM-dd") ? (
            <p className="m-auto text-lg font-bold">Today</p>
         ) : (
            <>
               <p>{daysOfWeek[date.getDay()]}</p>
               <p className="text-2xl">{date.getDate()}</p>
               <p>{months[date.getMonth()]}</p>
            </>
         )}
      </Link>
   );
}
