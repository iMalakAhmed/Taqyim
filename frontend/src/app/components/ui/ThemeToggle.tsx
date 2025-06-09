"use client";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className={`
        p-2 rounded-full
        text-text bg-background
        flex items-center justify-center
        transition-transform duration-500 ease-in-out
        transform hover:text-secondary
        ${dark ? "rotate-180" : "rotate-0"}
      `}
      aria-label="Toggle theme"
    >
      {dark ? <IconSun size={24} /> : <IconMoon size={24} />}
    </button>
  );
}
