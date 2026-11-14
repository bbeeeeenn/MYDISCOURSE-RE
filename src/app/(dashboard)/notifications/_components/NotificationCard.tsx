import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";
import { Bell, LogIn, LogOut } from "lucide-react";

type NotificationItem = {
   type: "CHECKED_IN" | "CHECKED_OUT" | "OTHER";
   message: string;
   createdAt: Date;
   read: boolean;
};

export default function NotificationCard({ item }: { item: NotificationItem }) {
   const Icon =
      item.type === "CHECKED_IN"
         ? LogIn
         : item.type === "CHECKED_OUT"
           ? LogOut
           : Bell;

   return (
      <article
         className={clsx(
            "flex items-start gap-3 border-b border-gray-200 px-4 py-4 last:border-b-0",
            !item.read && "bg-gray-100",
         )}
      >
         <Icon
            aria-hidden="true"
            className="text-primary mt-0.5 shrink-0"
            size={18}
         />
         <div className="min-w-0">
            <p className="text-base-400 text-sm leading-6">{item.message}</p>
            <time
               dateTime={item.createdAt.toISOString()}
               className="mt-1 block text-xs text-gray-500"
            >
               {formatDistanceToNow(item.createdAt, { addSuffix: true })}
            </time>
         </div>
      </article>
   );
}
