import Back from "@/components/ui/Back";
import { roomsPage } from "@/constants";
import restrict from "@/lib/restrict";
import CreateRoomForm from "./_components/form";

export const instant = false;
export default async function CreateRoomPage() {
   await restrict(["ADMIN"], roomsPage);

   return (
      <div className="p-2">
         <Back path={roomsPage} />
         <CreateRoomForm />
      </div>
   );
}
