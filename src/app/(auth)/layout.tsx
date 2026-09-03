import { roomsPage } from "@/constants";
import { auth } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";

export const instant = false;
export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (session?.user) {
    redirect(roomsPage);
  }

  return (
    <>
      <div className="relative h-screen">
        <Image
          src={"/csu_library.png"}
          alt="CSU Library"
          fill
          priority
          className="absolute inset-0 object-cover"
        />
        <div className="bg-base-400 absolute inset-0 h-svh w-screen opacity-75"></div>
        {children}
      </div>
    </>
  );
}
