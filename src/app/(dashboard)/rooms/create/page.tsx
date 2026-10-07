import Back from "@/components/ui/Back";
import { roomsPage } from "@/constants";
import restrict from "@/lib/restrict";
import CreateRoomForm from "./_components/form";
import { Suspense } from "react";

export default async function CreateRoomPage() {
   return (
      <Suspense>
         <Suspended />
      </Suspense>
   );
}
async function Suspended() {
   await restrict(["ADMIN"], roomsPage);

   return (
      <div className="p-2 pt-5">
         <Back path={roomsPage} />
         <CreateRoomForm />
      </div>
   );
}
