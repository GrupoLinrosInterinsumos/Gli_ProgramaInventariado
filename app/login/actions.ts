"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/conteo",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
}
