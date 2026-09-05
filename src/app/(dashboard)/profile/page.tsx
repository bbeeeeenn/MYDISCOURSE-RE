import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./_components/ProfileForm";
import SignOutButton from "./_components/SignOutButton";
import { Suspense } from "react";

async function Suspended() {
   const session = await auth();
   if (!session?.user.id) redirect("/signin");

   const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
         name: true,
         email: true,
         id_number: true,
         year_level: true,
         course: true,
         role: true,
      },
   });
   if (!user) redirect("/signin");
   return <ProfileForm user={user} />;
}

export default function AccountPage() {
   return (
      <>
         <div className="relative min-h-[calc(100dvh-56px)] pb-11">
            <Suspense>
               <Suspended />
            </Suspense>
            <SignOutButton />
         </div>
      </>
   );
}
