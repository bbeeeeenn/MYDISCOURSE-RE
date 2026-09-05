"use client";

import { signOut } from "next-auth/react";

export default function AccountPage() {
  return (
    <div className="relative min-h-[calc(100dvh-56px)] pb-11">
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/signin" })}
        className="text-base-100 absolute inset-x-0 bottom-0 bg-red-600 py-2 text-xl font-medium"
      >
        Sign out
      </button>
    </div>
  );
}
