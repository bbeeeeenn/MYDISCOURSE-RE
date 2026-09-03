"use client";
import { registerUser } from "@/actions/register";
import { roomsPage, signInPage } from "@/constants";
import { Eye, EyeClosed, LoaderCircle, Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useActionState, useState } from "react";

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
  const [error, setError] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setInfos((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onRegister = async () => {
    setError("");
    if (infos.password !== infos.confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    const res = await registerUser(infos.email, infos.password);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    window.location.href = roomsPage;
  };
  const [, registerAction, isPending] = useActionState(onRegister, undefined);

  return (
    <form
      action={registerAction}
      onSubmit={(e) => {
        if (isPending) e.preventDefault();
      }}
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
          required
          value={infos.email}
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
          required
          value={infos.password}
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
          required
          value={infos.confirmPassword}
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
      {error && (
        <p className="text-base-100/80 -my-1 rounded-md bg-red-800/30 px-2 py-4 text-center text-sm tracking-wide">
          {error}
        </p>
      )}
      <button className="flex items-center justify-center gap-2 rounded-md bg-yellow-500 py-2 font-semibold shadow-md">
        {isPending ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <LogIn size={20} />
        )}
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
