"use client";

import { roomsPage } from "@/constants";
import { Lock, Mail, X, XCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SigninModal() {
   const router = useRouter();
   const dialogRef = useRef<HTMLDialogElement>(null);
   useEffect(() => {
      dialogRef.current?.showModal();
   }, []);
   return (
      <dialog
         ref={dialogRef}
         onClose={() => router.back()}
         className="relative m-auto max-h-150 w-[calc(100%-32px)] max-w-250 rounded-lg shadow-md outline-none select-none backdrop:backdrop-blur-xs sm:grid sm:h-[calc(100%-32px)]"
         style={{
            gridTemplateColumns: "350px 1fr",
         }}
      >
         <div className="flex flex-col justify-center p-5">
            <Image
               src={"/logo.png"}
               alt=""
               width={400}
               height={100}
               loading="eager"
               className="mx-auto mb-5 w-60"
            />
            <h1 className="mb-4 text-center text-xl font-medium text-gray-500">
               Log in to your account
            </h1>
            <form action={() => {}}>
               <div className="flex items-center gap-1 rounded-sm border-2 border-gray-500 p-1 text-gray-500">
                  <span>
                     <Mail />
                  </span>
                  <input
                     type="email"
                     className="grow text-lg"
                     spellCheck={false}
                     placeholder="Email"
                  />
               </div>
               <div className="mt-4 flex items-center gap-1 rounded-sm border-2 border-gray-500 p-1 text-gray-500">
                  <span>
                     <Lock />
                  </span>
                  <input
                     type="password"
                     className="grow text-lg"
                     placeholder="Password"
                  />
               </div>
               <button className="mt-4 block w-full rounded-md bg-amber-400 py-2 font-medium shadow-sm">
                  Log in
               </button>
            </form>
            <div className="my-4 flex items-center gap-2">
               <div className="h-px grow bg-gray-500" />
               <p className="text-center">or</p>
               <div className="h-px grow bg-gray-500" />
            </div>
            <button
               onClick={() => signIn("google", { redirectTo: roomsPage })}
               className="relative block w-full rounded-md bg-gray-100 p-2 text-xl shadow-sm"
            >
               <span className="absolute inset-y-0 left-2 my-auto h-fit text-2xl">
                  <FcGoogle />
               </span>
               Sign in with Google
            </button>
         </div>
         <div className="relative hidden sm:block">
            <Image
               src={"/csu_library.png"}
               alt="CSU Library"
               fill
               className="size-full object-cover"
            />
            <div className="bg-base-400 absolute inset-0 opacity-60"></div>
         </div>
         <button
            className="absolute top-2 right-2"
            onClick={() => dialogRef.current?.close()}
         >
            <XCircle className="hidden text-white sm:block" />
            <X className="sm:hidden" />
         </button>
      </dialog>
   );
}
