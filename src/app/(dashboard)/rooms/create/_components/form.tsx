"use client";

import createRoom from "@/actions/rooms/create";
import { roomsPage } from "@/constants";
import { uploadToCloudinary } from "@/lib/cloudinary_helpers";
import { ImagePlus, LoaderCircle, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CreateRoomForm() {
   const router = useRouter();
   const [infos, setInfos] = useState<{
      name: string;
      location: string;
      capacity: string;
      image?: File;
   }>({
      name: "",
      location: "",
      capacity: "10",
      image: undefined,
   });

   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInfos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const [imageBlob, setImageBlob] = useState<string | undefined>(undefined);
   const handleImageChoose = (e: ChangeEvent<HTMLInputElement>) => {
      const image = e.target.files?.[0];
      if (!image) return;
      setInfos((prev) => ({ ...prev, image }));
      setImageBlob(URL.createObjectURL(image));
   };
   const handleImageRemove = () => {
      setInfos((prev) => ({ ...prev, image: undefined }));
      setImageBlob(undefined);
   };

   useEffect(() => {
      return () => {
         if (imageBlob) {
            URL.revokeObjectURL(imageBlob);
         }
      };
   }, [imageBlob]);

   const onCreateRoom = async () => {
      try {
         const image = infos.image && (await uploadToCloudinary(infos.image));

         const res = await createRoom({
            name: infos.name,
            capacity: Number.parseInt(infos.capacity, 10) || 10,
            location: infos.location,
            imageUrl: image?.secure_url,
            imagePublicId: image?.public_id,
         });
         toast(res.ok ? res.data.message : res.message, {
            type: res.ok ? "success" : "error",
            autoClose: 3000,
         });
         if (res.ok) {
            setInfos({
               capacity: "10",
               location: "",
               name: "",
               image: undefined,
            });
            setImageBlob(undefined);
            router.replace(roomsPage);
         }
      } catch (e) {
         if (e instanceof Error) {
            toast.error(e.message);
         }
      }
   };
   const [, formAction, isPending] = useActionState(onCreateRoom, undefined);
   return (
      <form
         action={formAction}
         onSubmit={(e) => {
            if (isPending) e.preventDefault();
         }}
         className="mt-5 grid max-w-2xl gap-5 px-2 pb-8"
      >
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Create room</h1>
            <p className="mt-1 text-sm text-gray-500">
               Add the room details and an optional photo.
            </p>
         </div>
         <div>
            <p className="mb-2 text-sm font-semibold tracking-wide text-gray-700">
               Room image
            </p>
            <div className="relative w-full max-w-52">
               <label
                  htmlFor="image"
                  className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 transition-colors hover:border-amber-500 hover:bg-amber-50"
               >
                  {imageBlob ? (
                     <Image
                        src={imageBlob}
                        alt="Selected room"
                        fill
                        sizes="208px"
                        unoptimized
                        className="object-cover"
                     />
                  ) : (
                     <span className="flex flex-col items-center gap-2 text-gray-500">
                        <ImagePlus size={28} />
                        <span className="text-sm font-medium">
                           Choose image
                        </span>
                     </span>
                  )}
               </label>
               {imageBlob && (
                  <button
                     type="button"
                     aria-label="Remove image"
                     title="Remove image"
                     className="absolute top-2 right-2 rounded-full bg-white p-2 text-gray-700 shadow-md transition-colors hover:bg-red-50 hover:text-red-700"
                     onClick={handleImageRemove}
                  >
                     <X size={16} />
                  </button>
               )}
            </div>
         </div>
         <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChoose}
         />
         <label
            className="grid gap-1.5 text-sm font-semibold text-gray-700"
            htmlFor="name"
         >
            Name
            <input
               type="text"
               autoComplete="off"
               name="name"
               id="name"
               value={infos.name}
               required
               onChange={handleInputChange}
               className="rounded-md border border-gray-300 bg-white p-2.5 text-base font-normal transition outline-none"
            />
         </label>
         <label
            className="grid gap-1.5 text-sm font-semibold text-gray-700"
            htmlFor="location"
         >
            Location
            <input
               type="text"
               autoComplete="off"
               name="location"
               id="location"
               value={infos.location}
               required
               onChange={handleInputChange}
               className="rounded-md border border-gray-300 bg-white p-2.5 text-base font-normal transition outline-none"
            />
         </label>
         <label
            className="grid gap-1.5 text-sm font-semibold text-gray-700"
            htmlFor="capacity"
         >
            Capacity
            <input
               type="number"
               autoComplete="off"
               name="capacity"
               id="capacity"
               min={1}
               required
               value={infos.capacity}
               onChange={handleInputChange}
               className="rounded-md border border-gray-300 bg-white p-2.5 text-base font-normal transition outline-none"
            />
         </label>
         <button
            type="submit"
            disabled={isPending}
            className="bg-base-200 text-base-100 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-base font-semibold shadow-sm transition hover:brightness-110 disabled:opacity-75"
         >
            {isPending ? (
               <>
                  <span>
                     <LoaderCircle className="animate-spin" />
                  </span>
                  Creating
               </>
            ) : (
               <>
                  <span>
                     <Plus />
                  </span>
                  Create
               </>
            )}
         </button>
      </form>
   );
}
