"use client";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  // Initialize state as undefined to detect initial load
  const [dark, setDark] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("theme");
    // Also check for system preference
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Use saved theme if exists, otherwise use system preference
    const initialDark = savedTheme ? savedTheme === "dark" : systemDark;
    setDark(initialDark);

    // Apply the class immediately
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (dark === undefined) return;

    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Don't render until we know the theme to prevent flash
  if (dark === undefined) {
    return null;
  }

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`p-2 rounded-full
        text-text bg-background
        flex items-center justify-center
        transition-transform duration-500 ease-in-out
        transform hover:text-secondary
        ${dark ? "rotate-180" : "rotate-0"}`}
      aria-label="Toggle theme"
    >
      {dark ? <IconSun size={24} /> : <IconMoon size={24} />}
    </button>
  );
}
