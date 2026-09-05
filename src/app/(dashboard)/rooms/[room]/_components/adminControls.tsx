"use client";

import editRoom from "@/actions/rooms/edit";
import { RoomModel } from "@/generated/prisma/models";
import { uploadToCloudinary } from "@/lib/cloudinary_helpers";
import clsx from "clsx";
import { ImagePlus, LoaderCircle, Pen, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
   ChangeEvent,
   Fragment,
   useActionState,
   useEffect,
   useRef,
   useState,
} from "react";
import { toast } from "react-toastify";
import deleteRoom from "@/actions/rooms/delete";
import { roomsPage } from "@/constants";
import { usePathname } from "next/navigation";
import { Dialog, toggleDialog } from "@/components/ui/Dialog";

export default function AdminControls({ room }: { room: RoomModel }) {
   const pathname = usePathname(); // used for key
   const session = useSession();
   const editDialogRef = useRef<HTMLDialogElement>(null);
   const deleteDialogRef = useRef<HTMLDialogElement>(null);

   return (
      session.data?.user.role === "ADMIN" && (
         <Fragment key={pathname}>
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
         </Fragment>
      )
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
            imagePublicId: infos.image
               ? room.image_public_id || undefined
               : updatedImage?.public_id,
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
         className="max-h-[min(70vh,42rem)] space-y-5 overflow-y-auto px-4 py-6"
      >
         <div>
            <p className="mb-2 text-sm font-semibold tracking-wide text-gray-700">
               Room image
            </p>
            <div className="relative mx-auto w-full max-w-52">
               <label
                  htmlFor="image"
                  className={clsx(
                     "relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-400 bg-gray-100 transition-colors hover:border-amber-500 hover:bg-amber-50",
                     (infos.image || newImage.blob) &&
                        "border-solid border-gray-300",
                  )}
               >
                  {!infos.image && !newImage.blob && (
                     <span className="flex flex-col items-center gap-2 text-gray-500">
                        <ImagePlus size={28} />
                        <span className="text-sm font-medium">
                           Choose image
                        </span>
                     </span>
                  )}
                  {infos.image ? (
                     <Image
                        src={infos.image}
                        alt=""
                        fill
                        sizes="208px"
                        className="object-cover"
                     />
                  ) : (
                     newImage.blob && (
                        <Image
                           src={newImage.blob}
                           alt=""
                           fill
                           sizes="208px"
                           onLoad={() => setImageLoading(false)}
                           onError={() => setImageLoading(false)}
                           className="object-cover"
                        />
                     )
                  )}
                  {imageLoading && (
                     <span className="text-base-100 absolute inset-0 flex items-center justify-center bg-black/25">
                        <LoaderCircle className="animate-spin" />
                     </span>
                  )}
               </label>
               {(infos.image || newImage.blob) && (
                  <button
                     type="button"
                     aria-label="Remove image"
                     title="Remove image"
                     className="absolute top-2 right-2 rounded-full bg-white p-2 text-gray-700 shadow-md transition-colors hover:bg-red-50 hover:text-red-700"
                     onClick={handleImageRemove}
                  >
                     <Trash2 size={16} />
                  </button>
               )}
            </div>
         </div>
         <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            hidden
            onChange={onImageChoose}
         />
         <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                  className="rounded-md border border-gray-300 bg-white p-2.5 text-base font-normal transition outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
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
                  required
                  id="location"
                  value={infos.location}
                  onChange={handleInputChange}
                  className="rounded-md border border-gray-300 bg-white p-2.5 text-base font-normal transition outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
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
                  className="rounded-md border border-gray-300 bg-white p-2.5 text-base font-normal transition outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
               />
            </label>
         </div>
         <button
            type="submit"
            className={clsx(
               "bg-base-200 text-base-100 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-base font-semibold shadow-sm transition hover:brightness-110",
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
