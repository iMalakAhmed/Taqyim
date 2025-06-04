"use client";

import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState } from "react";

export default function TypingHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10); // slight delay for transition to trigger
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`w-full flex flex-col items-center transition-opacity duration-1000 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <h1 className="text-5xl text-text font-heading pt-5">TAQYIM</h1>
      <h2 className="text-3xl text-text font-body font-extralight p-3 text-center">
        Discover Local Legends—One{" "}
        <span className="text-accent">
          <Typewriter
            words={["Review", "Story", "Experience"]}
            loop={0}
            cursor
            cursorStyle="|"
            typeSpeed={100}
            deleteSpeed={80}
            delaySpeed={1000}
          />
        </span>{" "}
        at a Time.
      </h2>
    </div>
  );
}
