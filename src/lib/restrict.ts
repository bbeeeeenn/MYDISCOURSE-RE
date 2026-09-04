import "server-only";
import { redirect } from "next/navigation";
import { signInPage } from "@/constants";
import { auth } from "./auth";
export default async function restrict(
   allowedRoles: ("ADMIN" | "STAFF" | "STUDENT")[],
   redirectTo: string,
) {
   const session = await auth();
   if (!session?.user) redirect(signInPage);

   if (!allowedRoles.includes(session.user.role)) {
      redirect(redirectTo);
   }
}
