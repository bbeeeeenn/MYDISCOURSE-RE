"use client";
import { signInPage } from "@/constants";
import { Eye, EyeClosed, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

export default function SignupPage() {
  const [infos, setInfos] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirm: false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInfos((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <form
      // action={registerAction}
      className="bg-base-200 text-base-400 fixed inset-x-3 inset-y-0 m-auto flex h-fit max-w-100 flex-col justify-center space-y-3 gap-y-4 rounded-lg px-7 py-10 select-none"
    >
      <h2 className="text-center text-2xl font-bold">Create an Account</h2>
      <div className="flex items-center gap-2">
        <span>
          <Mail />
        </span>
        <input
          type="text"
          name="email"
          placeholder="Email"
          autoComplete="off"
          spellCheck={false}
          onChange={handleInputChange}
          className="focus:border-base-400 border-base-400/30 grow border-b-2 text-lg transition-[border]"
        />
      </div>
      <div className="flex items-center gap-2">
        <span>
          <Lock />
        </span>
        <input
          type={showPassword.password ? "text" : "password"}
          name="password"
          placeholder="Password"
          autoComplete="off"
          onChange={handleInputChange}
          className="focus:border-base-400 border-base-400/30 grow border-b-2 text-lg transition-[border]"
        />
        <button
          type="button"
          onClick={() =>
            setShowPassword((prev) => ({ ...prev, password: !prev.password }))
          }
        >
          {showPassword.password ? <Eye /> : <EyeClosed />}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span>
          <Lock />
        </span>
        <input
          type={showPassword.confirm ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          autoComplete="off"
          onChange={handleInputChange}
          className="focus:border-base-400 border-base-400/30 grow border-b-2 text-lg transition-[border]"
        />
        <button
          type="button"
          onClick={() =>
            setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
          }
        >
          {showPassword.confirm ? <Eye /> : <EyeClosed />}
        </button>
      </div>
      <button className="rounded-md bg-yellow-500 py-2 font-semibold shadow-md">
        Sign Up
      </button>
      <p className="text-center">
        Already have an account?{" "}
        <Link href={signInPage} className="underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
