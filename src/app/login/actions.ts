"use server";

import { redirect } from "next/navigation";
import { verifyCredentials, createSessionCookie } from "@/lib/auth";

export async function loginAction(_prevState: { error: string } | null, formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Enter a username and password." };
  }

  const session = await verifyCredentials(username, password);
  if (!session) {
    return { error: "Incorrect username or password." };
  }

  await createSessionCookie(session);
  redirect("/dashboard");
}
