"use client";

import {
   // homePage,
   notificationsPage,
   myReservationsPage,
   roomsPage,
   reportsPage,
   reservationsPage,
   usersPage,
   profilePage,
   signInPage,
   landingPage,
   studentRecordsPage,
} from "@/constants";
import { Role } from "@/generated/prisma/enums";
import clsx from "clsx";
import {
   BellRing,
   BookUser,
   ChevronRight,
   CircleUserRound,
   DoorOpen,
   // House,
   LogIn,
   LucideIcon,
   Menu,
   StickyNote,
   Tent,
   Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type SidebarItem = {
   label: string;
   icon: LucideIcon;
   link: string;
};

const itemsFor: Record<Role | "UNAUTHENTICATED", SidebarItem[]> = {
   UNAUTHENTICATED: [
      { icon: DoorOpen, label: "Rooms", link: roomsPage },
      { icon: LogIn, label: "Sign In", link: signInPage },
   ],
   STUDENT: [
      { icon: DoorOpen, label: "Rooms", link: roomsPage },
      { icon: Tent, label: "My Reservations", link: myReservationsPage },
      // { icon: Bell, label: "Notifications", link: notificationsPage },
      { icon: CircleUserRound, label: "Profile", link: profilePage },
   ],
   STAFF: [
      { icon: DoorOpen, label: "Rooms", link: roomsPage },
      { icon: Tent, label: "My Reservations", link: myReservationsPage },
      { icon: Tent, label: "Reservations", link: reservationsPage },
      { icon: StickyNote, label: "Reports", link: reportsPage },
      // { icon: Bell, label: "Notifications", link: notificationsPage },
      { icon: CircleUserRound, label: "Profile", link: profilePage },
   ],
   ADMIN: [
      { icon: DoorOpen, label: "Rooms", link: roomsPage },
      { icon: Tent, label: "My Reservations", link: myReservationsPage },
      { icon: Tent, label: "Reservations", link: reservationsPage },
      { icon: StickyNote, label: "Reports", link: reportsPage },
      // { icon: Bell, label: "Notifications", link: notificationsPage },
      { icon: BookUser, label: "Student Records", link: studentRecordsPage },
      { icon: Users, label: "Users", link: usersPage },
      { icon: CircleUserRound, label: "Profile", link: profilePage },
   ],
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const session = useSession();

   const [mobile, setMobile] = useState(false);
   const [desktop, setDesktop] = useState(true);
   const [notifCount, setNotifCount] = useState(0);

   const items: SidebarItem[] =
      session.status === "authenticated"
         ? itemsFor[session.data.user.role]
         : session.status === "unauthenticated"
           ? itemsFor["UNAUTHENTICATED"]
           : [{ icon: DoorOpen, label: "Rooms", link: roomsPage }];

   useEffect(() => {
      const controller = new AbortController();
      (async () => {
         try {
            if (!session.data) return;
            const res = await fetch(
               `/api/notification-count?id=${session.data.user.id}`,
               { signal: controller.signal },
            );
            const data = await res.json();
            if (data.ok) {
               setNotifCount(data.count);
            }
         } catch (e) {
            if (e instanceof DOMException && e.name === "AbortError") return;
            console.error(e);
         }
      })();
      return () => controller.abort();
   }, [pathname, session.data]);

   return (
      <>
         <nav
            className={clsx(
               "fixed inset-0 z-999 flex flex-col items-start",
               mobile
                  ? "pointer-events-auto sm:pointer-events-none"
                  : "pointer-events-none",
            )}
         >
            {/* Topbar */}
            <div className="pointer-events-auto z-100 flex items-center gap-2 self-stretch bg-gray-200 px-4 py-3 shadow-md">
               <button
                  onClick={() => setMobile((prev) => !prev)}
                  className="sm:hidden"
               >
                  <Menu />
               </button>
               <button
                  onClick={() => setDesktop((prev) => !prev)}
                  className="hidden sm:block"
               >
                  <Menu />
               </button>
               <Link href={landingPage} className="block w-25 min-w-25">
                  <Image
                     src={"/logo.png"}
                     alt=""
                     width={400}
                     height={100}
                     loading="eager"
                     className="w-full"
                  />
               </Link>
               <p className="text-2xl">/</p>
               <p className="truncate font-medium">
                  {items.find((i) => pathname.includes(i.link))?.label}
               </p>
               {session.status === "authenticated" && (
                  <Link
                     href={notificationsPage}
                     className="relative ml-auto inline-block rounded-full border border-gray-400 bg-gray-300 p-1.5 text-xs text-gray-500"
                  >
                     {notifCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full border border-red-700 bg-red-500 text-white">
                           {notifCount > 9 ? "9+" : notifCount}
                        </div>
                     )}
                     <BellRing size={20} />
                  </Link>
               )}
            </div>

            {/* Sidebar */}
            <aside
               inert={!mobile && !desktop}
               className={clsx(
                  "pointer-events-auto flex w-full grow flex-col items-stretch border-r-amber-500 bg-gray-100 transition-[translate,width] sm:w-53 sm:border-r-4",
                  mobile ? "translate-x-0" : "-translate-x-full",
                  desktop ? "sm:translate-x-0" : "sm:-translate-x-full",
               )}
            >
               {items.map((item, i) => {
                  const isActive = pathname.includes(item.link);
                  return (
                     <Link
                        key={item.label + item.link}
                        href={item.link}
                        inert={isActive}
                        className={clsx(
                           "flex items-center gap-2 px-3 py-3",
                           isActive
                              ? "pointer-events-none bg-gray-500 text-white"
                              : "hover:bg-gray-200",
                           i === items.length - 1 &&
                              item.link === profilePage &&
                              "mt-auto",
                        )}
                        onClick={() => setMobile(false)}
                     >
                        <span>
                           <item.icon size={20} />
                        </span>
                        <p>{item.label}</p>
                        {!isActive && (
                           <span className="ml-auto">
                              <ChevronRight size={20} />
                           </span>
                        )}
                     </Link>
                  );
               })}
            </aside>
         </nav>

         <main
            className={clsx(
               "relative pt-14 transition-[padding-left]",
               desktop && "sm:pl-53",
            )}
         >
            {children}
         </main>
      </>
   );
}
