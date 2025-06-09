import { redirect } from "next/navigation";

export default function ProfileRedirect() {
  redirect("/business/me");
}
