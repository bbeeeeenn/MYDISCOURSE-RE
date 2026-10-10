import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./_components/ProfileForm";
import PasswordForm from "./_components/PasswordForm";
import SignOutButton from "./_components/SignOutButton";
import { Suspense } from "react";

export default function AccountPage() {
   return (
      <div className="relative min-h-[calc(100dvh-56px)] pb-11">
         <Suspense fallback={<ProfileFallback />}>
            <Suspended />
         </Suspense>
         <SignOutButton />
      </div>
   );
}

async function Suspended() {
   await new Promise((resolve) => setTimeout(resolve, 2000));
   const session = await auth();
   if (!session?.user.id) redirect("/signin");

   const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
         name: true,
         email: true,
         role: true,
         password: true,
      },
   });
   if (!user) redirect("/signin");
   return (
      <>
         <ProfileForm
            user={{
               name: user.name,
               email: user.email,
               role: user.role,
            }}
         />
         <PasswordForm hasPassword={Boolean(user.password)} />
      </>
   );
}

function ProfileFallback() {
   return (
      <div
         className="mx-auto grid max-w-2xl animate-pulse gap-4 p-4"
         aria-busy="true"
      >
         <div>
            <div className="h-8 w-24 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-72 max-w-full rounded bg-gray-200" />
         </div>
         {["name", "email"].map((field) => (
            <div key={field} className="grid gap-2">
               <div className="h-4 w-20 rounded bg-gray-200" />
               <div className="h-11 w-full rounded bg-gray-200" />
            </div>
         ))}
         <div className="mt-4 h-32 rounded bg-gray-200" />
         <div className="h-4 w-32 rounded bg-gray-200" />
         <div className="h-10 w-full rounded-md bg-gray-200" />
      </div>
   );
}
