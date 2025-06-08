"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(token: string) {
  try {
    (await cookies()).set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    console.error("Failed to set auth cookie:", error);
    throw error;
  }
}

export async function removeAuthCookie() {
  try {
    (await cookies()).delete("token");
  } catch (error) {
    console.error("Failed to remove auth cookie:", error);
    throw error;
  }
}