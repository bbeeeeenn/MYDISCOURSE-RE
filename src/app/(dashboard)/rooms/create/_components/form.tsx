"use client";

import createRoom from "@/actions/rooms/create";
import { uploadToCloudinary } from "@/lib/cloudinary_helpers";
import { ImagePlus, LoaderCircle, Plus, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useActionState, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CreateRoomForm() {
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
         const imageUrl = infos.image
            ? await uploadToCloudinary(infos.image)
            : undefined;
         const res = await createRoom({
            name: infos.name,
            capacity: Number.parseInt(infos.capacity, 10) || 10,
            location: infos.location,
            imageUrl,
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
         className="mt-10 px-2"
      >
         <h1 className="mb-5 text-2xl font-medium text-gray-600">
            Create Room
         </h1>
         {imageBlob ? (
            <label
               htmlFor="image"
               className="relative block w-fit cursor-pointer"
            >
               <Image
                  src={imageBlob}
                  alt="image"
                  width={500}
                  height={500}
                  unoptimized
                  className="aspect-square w-40 rounded-md object-cover"
               />
               <button
                  type="button"
                  className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-1"
                  onClick={handleImageRemove}
               >
                  <X size={15} />
               </button>
            </label>
         ) : (
            <label
               htmlFor="image"
               className="flex aspect-square w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-500 bg-gray-300 text-gray-500"
            >
               <ImagePlus />
            </label>
         )}
         <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChoose}
         />
         <label htmlFor="name" className="mt-2 block w-fit text-gray-700">
            Name
         </label>
         <input
            type="text"
            autoComplete="off"
            name="name"
            id="name"
            value={infos.name}
            required
            onChange={handleInputChange}
            className="block w-full max-w-100 rounded-sm border-2 border-gray-500 p-1 text-lg"
         />
         <label htmlFor="location" className="mt-2 block w-fit text-gray-700">
            Location
         </label>
         <input
            type="text"
            autoComplete="off"
            name="location"
            required
            id="location"
            value={infos.location}
            onChange={handleInputChange}
            className="block w-full max-w-100 rounded-sm border-2 border-gray-500 p-1 text-lg"
         />
         <label htmlFor="location" className="mt-2 block w-fit text-gray-700">
            Capacity
         </label>
         <input
            type="number"
            autoComplete="off"
            name="capacity"
            id="capacity"
            min={1}
            required
            value={infos.capacity}
            onChange={handleInputChange}
            className="block w-full max-w-100 rounded-sm border-2 border-gray-500 p-1 text-lg"
         />
         <button className="bg-base-200 text-base-100 mt-4 flex w-full max-w-100 items-center justify-center gap-1 rounded-md py-2 text-lg font-medium">
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
