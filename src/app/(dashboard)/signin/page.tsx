"use client";

import { login } from "@/actions/login";
import { roomsPage } from "@/constants";
import clsx from "clsx";
import { LoaderCircle, Lock, Mail, X, XCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SubmitEvent, useActionState, useEffect, useRef } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SigninModal() {
   const router = useRouter();
   const dialogRef = useRef<HTMLDialogElement>(null);
   const [state, formAction, isPending] = useActionState(
      async (_previousState: unknown, formData: FormData) => {
         const result = await login(formData);
         if (result.ok) {
            window.location.assign(roomsPage);
         }
         return result;
      },
      undefined,
   );

   const preventWhilePending = (event: SubmitEvent<HTMLFormElement>) => {
      if (isPending) event.preventDefault();
   };

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
            <form
               action={formAction}
               onSubmit={preventWhilePending}
               aria-busy={isPending}
            >
               <div className="flex items-center gap-1 rounded-sm border-2 border-gray-500 p-1 text-gray-500">
                  <span>
                     <Mail />
                  </span>
                  <input
                     type="email"
                     name="email"
                     required
                     autoComplete="email"
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
                     name="password"
                     required
                     autoComplete="current-password"
                     className="grow text-lg"
                     placeholder="Password"
                  />
               </div>
               {state && !state.ok && (
                  <p className="mt-3 text-sm text-red-700" role="alert">
                     {state.message}
                  </p>
               )}
               <button
                  type="submit"
                  disabled={isPending}
                  className={clsx(
                     "mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 py-2 font-medium shadow-sm",
                     isPending && "cursor-wait opacity-75",
                  )}
               >
                  {isPending && (
                     <LoaderCircle className="animate-spin" size={18} />
                  )}
                  {isPending ? "Logging in" : "Log in"}
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
