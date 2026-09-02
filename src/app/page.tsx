import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="bg-base-100 fixed inset-x-0 top-0 z-100 flex items-center justify-between px-3 py-3">
        <Image
          src={"/logo.png"}
          alt="logo"
          width={130}
          height={40}
          className="w-32 sm:w-50 md:size-auto"
        />
        <div className="flex items-center gap-2 font-bold sm:gap-4 md:mr-4 md:gap-6">
          <Link href={"/"} className="text-sm sm:text-lg md:text-xl">
            Help
          </Link>
          <Link
            href={"/"}
            className="text-base-100 bg-base-300 rounded-full px-4 py-2 text-xs sm:text-sm md:text-base"
          >
            Browse Rooms
          </Link>
        </div>
      </nav>

      <div className="mt-20 flex flex-wrap-reverse items-center justify-center gap-x-4 gap-y-4 px-8 md:flex-nowrap">
        <div className="max-w-180 space-y-4">
          <p className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            FIND A <span className="text-base-300">SPACE</span> TO SHARE IDEAS
          </p>
          <p className="text-sm md:text-lg lg:text-xl">
            Book discussion rooms, storytelling rooms, multimedia rooms, and
            more - all in one place.
          </p>
        </div>
        <div className="max-w-100 lg:max-w-full">
          <Image src={"/csu_duo_statue.png"} alt="" width={500} height={500} />
        </div>
      </div>

      <div className="mt-30 grid gap-4 px-3 md:grid-cols-3">
        {/* Card 1 */}
        <div className="text-base-100 relative max-h-95 min-h-95 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 z-10 space-y-3 p-7">
            <p className="text-2xl font-bold">01</p>
            <p className="text-lg font-bold">DISCUSS</p>
            <p className="text-sm">
              Engage in meaningful discussions with a vibrant community.
            </p>
          </div>
          <Image
            src={"/hero_card_photos/1.jpg"}
            alt=""
            width={500}
            height={500}
            className="size-full object-cover brightness-30"
          />
        </div>
        {/* Card 2 */}
        <div className="text-base-100 relative max-h-95 min-h-95 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 z-10 space-y-3 p-7">
            <p className="text-2xl font-bold">01</p>
            <p className="text-lg font-bold">CONTRIBUTE</p>
            <p className="text-sm">
              Share your knowledge and insights to help others.
            </p>
          </div>
          <Image
            src={"/hero_card_photos/7.jpg"}
            alt=""
            width={500}
            height={500}
            className="size-full object-cover brightness-30"
          />
        </div>
        {/* Card 3 */}
        <div className="text-base-100 relative max-h-95 min-h-95 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 z-10 space-y-3 p-7">
            <p className="text-2xl font-bold">01</p>
            <p className="text-lg font-bold">CONNECT</p>
            <p className="text-sm">
              Build connections and network with like-minded individuals.
            </p>
          </div>
          <Image
            src={"/hero_card_photos/2.jpg"}
            alt=""
            width={500}
            height={500}
            className="size-full object-cover brightness-30"
          />
        </div>
      </div>

      <footer className="bg-base-400 mt-[40svh] flex items-center justify-center px-10 py-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex w-40 items-center">
            <Image
              src={"/csu_logo.png"}
              alt=""
              height={200}
              width={200}
              className="w-[20%]"
            />
            <Image
              src={"/logo.png"}
              alt=""
              height={200}
              width={200}
              className="w-[80%]"
            />
          </div>
          <p className="text-base-100 text-center text-xs">
            Copyright © 2026 - All right reserved
          </p>
        </div>
      </footer>
    </>
  );
}
