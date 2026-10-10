"use server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function login(
  formData: FormData,
): ActionResult<{ message: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "Email and password are required",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { ok: true, data: { message: "Logged in successfully" } };
  } catch (e) {
    if (e instanceof AuthError && e.type === "CredentialsSignin")
      return {
        ok: false,
        error: "VALIDATION",
        message: "Incorrect email or password",
      };
    console.error(e);
    return {
      ok: false,
      error: "OTHER",
      message: "Something went wrong. Try again later",
    };
  }
}
