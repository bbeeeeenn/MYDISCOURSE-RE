"use client";

import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Back({ path }: { path?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (path) router.replace(path);
        else router.back();
      }}
      className="flex items-center gap-1"
    >
      <span>
        <Undo2 size={20} />
      </span>
      <u>Back</u>
    </button>
  );
}
