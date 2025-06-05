"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconUser } from "@tabler/icons-react";

interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  // Add other fields you return from /api/me if needed
}

export default function NavBar() {
  const pathname = usePathname();
  const isFixed = pathname !== "/";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          console.log(data.user);
          setUser(data.user); // your API returns { user: {...} }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

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
          {!loading && user && (
            <Link
              href="/profile"
              className="text-text hover:text-accent flex items-center space-x-2"
            >
              <IconUser size={24} />
              <span>{user.firstName}</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
