"use client";

import {
  Eye,
  EyeClosed,
  Lock,
  CircleArrowLeft,
  Mail,
  LoaderCircle,
  LogIn,
} from "lucide-react";
import { type ChangeEvent, useState, useActionState } from "react";
import Link from "next/link";
import { roomsPage, signUpPage } from "@/constants";
import clsx from "clsx";
import { toast } from "react-toastify";
import { login } from "@/actions/login";

export default function LoginForm() {
  const [infos, setInfos] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInfos((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const loginAction = async (_: unknown, formData: FormData) => {
    const res = await login(formData);
    if (!res.ok) {
      toast.error(res.message);
    } else window.location.reload();
  };

  const [, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (isPending) e.preventDefault();
      }}
      className="bg-base-200 text-primary-content fixed inset-x-3 inset-y-0 m-auto flex h-fit max-w-100 flex-col justify-center rounded-lg px-7 py-10"
    >
      <h2 className="text-center text-2xl font-bold">Sign In</h2>

      {/* Username */}
      <div className="mt-6 flex w-full items-center gap-2">
        <span>
          <Mail />
        </span>
        <div className="grow border-b-2 border-[#003200]/20 transition-[border-color] focus-within:border-[#003200]">
          <input
            placeholder="Email"
            name="email"
            type="email"
            required
            value={infos.email}
            onChange={handleChange}
            className="font-outfit size-full text-lg outline-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mt-7 flex w-full items-center gap-2">
        <span>
          {" "}
          <Lock />
        </span>
        <div className="grow border-b-2 border-[#003200]/20 transition-[border-color] focus-within:border-[#003200]">
          <input
            placeholder="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={infos.password}
            onChange={handleChange}
            className={clsx(
              "font-outfit size-full text-lg outline-none",
              !showPassword && infos.password.length > 0 && "tracking-widest",
            )}
          />
        </div>
        <button type="button" onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? <Eye /> : <EyeClosed />}
        </button>
      </div>

      <button
        type="submit"
        className="font-outfit mt-7 flex items-center justify-center gap-2 rounded-md bg-yellow-500 p-2 font-semibold"
      >
        <span className="">
          {isPending ? (
            <LoaderCircle size={20} className="animate-spin" />
          ) : (
            <LogIn size={20} />
          )}
        </span>
        Log in
      </button>
      <div className="mt-3 flex flex-row justify-center">
        No account?{" "}
        <Link href={signUpPage} className="ml-2 font-bold">
          Sign up here
        </Link>
      </div>
      <Link href={""} className="mt-3 flex flex-row justify-center">
        Forgot Password?
      </Link>
      <Link
        href={roomsPage}
        className="text-secondary mt-3 flex flex-row justify-center"
      >
        <CircleArrowLeft />
      </Link>
    </form>
  );
}
