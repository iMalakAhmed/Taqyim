import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    return user;
  } catch {
    return null;
  }
}
