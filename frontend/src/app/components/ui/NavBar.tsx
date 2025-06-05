"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { IconUser } from "@tabler/icons-react";
import { useDispatch } from 'react-redux';
import { useGetCurrentUserQuery, authApi } from "../../redux/services/authApi";
import { useRouter } from "next/navigation";
import { removeAuthCookie } from "../../actions/auth";

export default function NavBar() {
  const pathname = usePathname();
  const isFixed = pathname !== "/";
  const router = useRouter();
  const dispatch = useDispatch();

  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  const handleSignOut = async () => {
    try {
      // Call the backend signout API
      await fetch("/api/auth/signout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Error calling signout API:", err);
      // Continue with client-side signout even if API call fails
    }
    
    await removeAuthCookie(); // Remove the cookie
    // Invalidate RTK Query cache related to the user
    dispatch(authApi.util.resetApiState());
    router.push("/auth/login"); // Redirect to login page
  };

  return (
    <div
      className={`top-0 w-full z-[999] bg-background h-24 ${
        isFixed ? "fixed" : "relative"
      }`}
    >
      <div className="mx-24 flex flex-row justify-between items-center h-full">
        <Link href="/">
          <h1 className="font-heading text-text">TAQYIM</h1>
        </Link>

        <input />

        <div className="flex-1 mx-4 flex justify-center">
          <form className="w-full max-w-lg">
            <input
              type="text"
              placeholder="Search Reviews..."
              className="w-full h-10 px-4 rounded-full text-text border border-text focus:outline-none focus:border-accent"
            />
          </form>
        </div>
        <div className="flex items-center space-x-4">
          {!isLoading && user && (
            <>
              <Link
                href="/profile"
                className="text-text hover:text-accent flex items-center space-x-2"
              >
                <IconUser size={24} />
                <span>{user.firstName}</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-700 cursor-pointer"
              >
                Sign Out
              </button>
            </>
          )}
          {!isLoading && !user && !error && (
            <Link href="/auth/login" className="text-text hover:text-accent">
              Login
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
