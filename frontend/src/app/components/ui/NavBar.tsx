"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import {
  IconBellRinging2,
  IconMail,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery, authApi } from "../../redux/services/authApi";
import { useRouter } from "next/navigation";
import { removeAuthCookie } from "../../actions/auth";
import Button from "./Button";
import React from "react";

export default function NavBar() {
  const pathname = usePathname();
  const isFixed = pathname !== "/";
  const router = useRouter();
  const dispatch = useDispatch();


  const {
    data: user,
    isLoading,
    refetch,
  } = useGetCurrentUserQuery(undefined, {
    pollingInterval: 1000, // Optional auto-refresh
    refetchOnMountOrArgChange: true,
  });


  // Temporarily commented out for debugging signup redirect issue
  // React.useEffect(() => {
  //   if (isError && !isLoading) {
  //     removeAuthCookie();
  //     router.push("/auth/login");
  //   }
  // }, [isError, isLoading, router]);
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

    sessionStorage.removeItem('token'); // Clear token from session storage
    await removeAuthCookie(); // Remove the cookie (for httpOnly token if any)
    // Invalidate RTK Query cache related to the user
    dispatch(authApi.util.resetApiState());
    router.push("/auth/login"); // Redirect to login page
  };

  return (
    <div
      className={`top-0 w-full z-[999] bg-background h-24 text-text ${
        isFixed ? "fixed" : "relative"
      }`}
    >
      <div className="mx-24 flex flex-row justify-between items-center h-full">
        {user ? (
          <Link href="/home">
            <h1 className="font-heading text-text">TAQYIM</h1>
          </Link>
        ) : (
          <Link href="/">
            <h1 className="font-heading text-text">TAQYIM</h1>
          </Link>
        )}

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
              <div className="relative group inline-block">
                <Link
                  href={`/profile/${user.userId}`}
                  className="text-text hover:text-secondary flex items-center space-x-2"
                >
                  <IconUserCircle size={24} />
                  <span>{user.userName}</span>
                </Link>

                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-32 bg-background border shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity duration-200 z-10 rounded">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-background border-l border-t rotate-45"></div>

                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-text hover:text-accent cursor-pointer rounded text-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <Button variant="none" size="sm" className="hover:text-secondary">
                <IconBellRinging2 />
              </Button>
              <Button variant="none" size="sm" className="hover:text-secondary">
                <IconMail />
              </Button>
              <ThemeToggle />
            </>
          )}
          {!isLoading && !user && (
            <div className="flex flex-row items-center gap-x-5">
              <Link href="/auth/login" className="text-text hover:text-accent">
                Login
              </Link>
              <Link href="/auth/signup" className="text-text hover:text-accent">
                Sign Up
              </Link>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
