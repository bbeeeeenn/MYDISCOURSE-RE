"use server";

import { notificationsPage } from "@/constants";
import { PrismaClientKnownRequestError } from "@/generated/prisma/internal/prismaNamespace";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function clearMyNotifications(): ActionResult<{
   message: string;
}> {
   try {
      const session = await auth();
      if (!session?.user)
         return { ok: false, error: "AUTH", message: "Unauthenticated" };

      await prisma.notification.deleteMany({
         where: { userId: session.user.id },
      });

      revalidatePath(notificationsPage);

      return {
         ok: true,
         data: { message: "Okay" },
      };
   } catch (e) {
      if (e instanceof PrismaClientKnownRequestError)
         return {
            ok: false,
            error: "DATABASE",
            message: "Database error",
         };
      console.error(e);
      return {
         ok: false,
         error: "OTHER",
         message: "Server error",
      };
   }
}
