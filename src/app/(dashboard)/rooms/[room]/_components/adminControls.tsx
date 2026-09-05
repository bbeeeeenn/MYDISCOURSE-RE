"use client";

import editRoom from "@/actions/rooms/edit";
import { RoomModel } from "@/generated/prisma/models";
import { uploadToCloudinary } from "@/lib/cloudinary_helpers";
import clsx from "clsx";
import { ImagePlus, LoaderCircle, Pen, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
   ChangeEvent,
   ReactNode,
   useActionState,
   useEffect,
   useRef,
   useState,
} from "react";
import { toast } from "react-toastify";
import deleteRoom from "@/actions/rooms/delete";
import { roomsPage } from "@/constants";

export default function AdminControls({ room }: { room: RoomModel }) {
   const session = useSession();
   const editDialogRef = useRef<HTMLDialogElement>(null);
   const deleteDialogRef = useRef<HTMLDialogElement>(null);

   return (
      session.data?.user.role === "ADMIN" && (
         <>
            <div className="text-base-100 absolute top-3 right-3 z-100 flex gap-4">
               <button onClick={() => toggleDialog(deleteDialogRef, true)}>
                  <Trash2 size={20} />
               </button>
               <button onClick={() => toggleDialog(editDialogRef, true)}>
                  <Pen size={20} />
               </button>
            </div>

            <Dialog
               dialogRef={deleteDialogRef}
               title={"Delete room"}
               onClose={() => toggleDialog(deleteDialogRef, false)}
            >
               <DeleteForm room={room} />
            </Dialog>

            <Dialog
               dialogRef={editDialogRef}
               title="Room Settings"
               onClose={() => toggleDialog(editDialogRef, false)}
            >
               <EditForm
                  room={room}
                  toggleDialog={(state) => toggleDialog(editDialogRef, state)}
               />
            </Dialog>
         </>
      )
   );
}

function toggleDialog(
   dialogRef: { current: HTMLDialogElement | null },
   state?: boolean,
) {
   const dialog = dialogRef.current;
   if (!dialog) return;

   if (state === undefined) {
      state = !dialog.open;
   }

   if (state) dialog.showModal();
   else dialog.close();
}

function Dialog({
   dialogRef,
   title,
   onClose,
   children,
}: {
   dialogRef: { current: HTMLDialogElement | null };
   title: string;
   onClose: () => void;
   children: ReactNode;
}) {
   return (
      <dialog
         ref={dialogRef}
         onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
         }}
         className="m-auto w-[calc(100%-16px)] max-w-150 rounded-md bg-gray-50 shadow-lg outline-none select-none"
      >
         <div className="flex justify-between border-b-4 border-b-amber-500 bg-[#d9d9d9] p-3 font-bold text-black/75">
            {title}
            <button onClick={onClose}>
               <X />
            </button>
         </div>
         {children}
      </dialog>
   );
}

function DeleteForm({ room }: { room: RoomModel }) {
   const [typedName, setTypedName] = useState("");
   const valid = typedName === room.room_name;

   const onDelete = async () => {
      if (!valid) return;
      const res = await deleteRoom(room.id);
      toast(res.ok ? res.data.message : res.message, {
         type: res.ok ? "success" : "error",
         position: "bottom-right",
      });
      if (res.ok) {
         window.location.assign(roomsPage);
      }
   };
   const [, deleteAction, isPending] = useActionState(onDelete, undefined);
   return (
      <form
         action={deleteAction}
         onSubmit={(e) => {
            if (isPending) e.preventDefault();
         }}
         className="px-4 py-6"
      >
         <p className="mb-2 text-gray-700">
            Type &quot;
            <span className="font-semibold select-text">{room.room_name}</span>
            &quot; to confirm delete
         </p>
         <input
            type="text"
            value={typedName}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setTypedName(e.target.value)}
            className="block w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
         />
         <button
            className={clsx(
               "text-base-100 mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-red-700 py-2 font-bold",
               (isPending || !valid) && "pointer-events-none opacity-30",
            )}
            disabled={isPending || !valid}
         >
            <span>
               {isPending ? (
                  <LoaderCircle className="animate-spin" />
               ) : (
                  <Trash2 />
               )}
            </span>
            {isPending ? "Deleting" : "Delete"}
         </button>
      </form>
   );
}

function EditForm({
   room,
   toggleDialog,
}: {
   room: RoomModel;
   toggleDialog: (state?: boolean) => void;
}) {
   const [infos, setInfos] = useState<{
      name: string;
      location: string;
      capacity: string;
      image: string | null;
   }>({
      name: room.room_name,
      location: room.location,
      capacity: room.capacity.toString(),
      image: room.image_url,
   });

   const [newImage, setNewImage] = useState<{
      file: File | undefined;
      blob: string | undefined;
   }>({ file: undefined, blob: undefined });
   const [imageLoading, setImageLoading] = useState(false);

   const onImageChoose = (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      setInfos((prev) => ({ ...prev, image: null }));
      setImageLoading(true);
      setNewImage({ file, blob: URL.createObjectURL(file) });
   };

   const handleImageRemove = () => {
      setInfos((prev) => ({ ...prev, image: null }));
      setImageLoading(false);
      setNewImage({ blob: undefined, file: undefined });
   };

   const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInfos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   useEffect(() => {
      return () => {
         if (newImage.blob) {
            URL.revokeObjectURL(newImage.blob);
         }
      };
   }, [newImage.blob]);

   const onEdit = async () => {
      try {
         const updatedImage =
            newImage.file && (await uploadToCloudinary(newImage.file));
         const res = await editRoom(room.id, {
            name: infos.name,
            location: infos.location,
            capacity: Number.parseInt(infos.capacity, 10) || room.capacity,
            imageUrl: infos.image || updatedImage?.secure_url,
            imagePublicId: infos.image || updatedImage?.public_id,
         });
         toast(res.ok ? res.data.message : res.message, {
            type: res.ok ? "success" : "error",
            autoClose: 3000,
            position: "bottom-right",
         });
         if (res.ok) {
            toggleDialog(false);
         }
      } catch (e) {
         if (e instanceof Error) {
            toast.error(e.message, { position: "bottom-right" });
         }
      }
   };
   const [, editAction, isPending] = useActionState(onEdit, undefined);

   return (
      <form
         action={editAction}
         onSubmit={(e) => {
            if (isPending) e.preventDefault();
         }}
         className="px-4 py-6"
      >
         <label
            htmlFor="image"
            className={clsx(
               "relative z-0 mx-auto flex aspect-square h-30 cursor-pointer items-center justify-center border-dashed border-gray-500 bg-gray-300",
               !infos.image && !newImage.blob && "border-2",
            )}
         >
            {!infos.image && !newImage.blob && (
               <ImagePlus className="absolute -z-10 text-gray-500" />
            )}
            {infos.image ? (
               <Image
                  src={infos.image}
                  alt=""
                  width={200}
                  height={200}
                  className="size-full rounded-md object-cover"
               />
            ) : (
               newImage.blob && (
                  <Image
                     src={newImage.blob}
                     alt=""
                     width={200}
                     height={200}
                     onLoad={() => setImageLoading(false)}
                     onError={() => setImageLoading(false)}
                     className="size-full rounded-md object-cover"
                  />
               )
            )}
            {imageLoading && (
               <LoaderCircle className="text-base-100 absolute animate-spin" />
            )}
            {(infos.image || newImage.blob) && (
               <button
                  type="button"
                  className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 rounded-full bg-gray-200 p-1 shadow-md"
                  onClick={handleImageRemove}
               >
                  <Trash2 size={15} />
               </button>
            )}
         </label>
         <input
            type="file"
            name="image"
            id="image"
            hidden
            onChange={onImageChoose}
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
            className="block w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
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
            className="block w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
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
            className="block w-full rounded-sm border-2 border-gray-500 p-1 text-lg"
         />
         <button
            type="submit"
            className={clsx(
               "bg-base-200 text-base-100 mt-4 flex w-full items-center justify-center gap-1 rounded-md py-2 text-lg font-medium",
               isPending && "opacity-75",
            )}
            disabled={isPending}
         >
            {isPending ? (
               <>
                  <span>
                     <LoaderCircle className="animate-spin" />
                  </span>
                  Updating
               </>
            ) : (
               <>
                  <span>
                     <Pen />
                  </span>
                  Update
               </>
            )}
         </button>
      </form>
   );
}
