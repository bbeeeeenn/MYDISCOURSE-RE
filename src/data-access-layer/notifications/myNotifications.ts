import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

type NotificationItem = {
   id: string;
   type: "CHECKED_IN" | "CHECKED_OUT" | "OTHER";
   message: string;
   createdAt: Date;
   read: boolean;
};

const sampleMessages: Array<{
   type: NotificationItem["type"];
   message: string;
   read: boolean;
}> = [
   {
      type: "CHECKED_IN",
      message:
         "Your reservation for the faculty briefing in Room 204 was timed in by staff member Dianne Santiago.",
      read: false,
   },
   {
      type: "CHECKED_OUT",
      message:
         "Your reservation for the IT support session in Room 301 was timed out by admin Rico Salcedo.",
      read: false,
   },
   {
      type: "CHECKED_IN",
      message:
         "Your reservation for the assessment review in Room 118 was timed in by staff member Mia Lopez.",
      read: false,
   },
   {
      type: "CHECKED_OUT",
      message:
         "Your reservation for the board meeting in Room 405 was timed out by admin Alden Cruz.",
      read: true,
   },
   {
      type: "CHECKED_IN",
      message:
         "Your reservation for the project consultation in Room 112 was timed in by staff member Jamie Lee.",
      read: true,
   },
   {
      type: "CHECKED_OUT",
      message:
         "Your reservation for the department meeting in Room 302 was timed out by admin Alex Reyes.",
      read: true,
   },
   {
      type: "CHECKED_IN",
      message:
         "Your reservation for the study session in Room 215 was timed in by staff member Sam Cruz.",
      read: true,
   },
   {
      type: "CHECKED_OUT",
      message:
         "Your reservation for the planning workshop in Room 109 was timed out by admin Taylor Garcia.",
      read: true,
   },
   {
      type: "CHECKED_IN",
      message:
         "Your reservation for the student consultation in Room 220 was timed in by staff member Jordan Kim.",
      read: true,
   },
   {
      type: "CHECKED_OUT",
      message:
         "Your reservation for the training session in Room 308 was timed out by admin Casey Santos.",
      read: true,
   },
   {
      type: "CHECKED_IN",
      message:
         "Your reservation for the research discussion in Room 117 was timed in by staff member Robin Flores.",
      read: true,
   },
   {
      type: "CHECKED_OUT",
      message:
         "Your reservation for the team review in Room 401 was timed out by admin Morgan Diaz.",
      read: true,
   },
];

export async function getMyNotifications({
   page,
   pageSize,
}: {
   page: number;
   pageSize: number;
}) {
   const notifications: NotificationItem[] = sampleMessages.map(
      (item, index) => ({
         ...item,
         id: `sample-notification-${index + 1}`,
         createdAt: new Date(Date.now() - (index + 1) * 60_000),
      }),
   );
   const total = notifications.length;
   const totalPages = Math.max(1, Math.ceil(total / pageSize));
   const currentPage = Math.min(page, totalPages);

   return {
      notifications: notifications.slice(
         (currentPage - 1) * pageSize,
         currentPage * pageSize,
      ),
      total,
      currentPage,
   };
}

export async function getMyNotificationsFromDatabase({
   page,
   pageSize,
}: {
   page: number;
   pageSize: number;
}) {
   const session = await auth();
   if (!session?.user.id) redirect("/signin");

   const where = { userId: session.user.id };
   const total = await prisma.notification.count({ where });
   const totalPages = Math.max(1, Math.ceil(total / pageSize));
   const currentPage = Math.min(page, totalPages);
   const notifications = await prisma.notification.findMany({
      where,
      select: {
         id: true,
         type: true,
         message: true,
         createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
   });

   return { notifications, total, currentPage };
}
