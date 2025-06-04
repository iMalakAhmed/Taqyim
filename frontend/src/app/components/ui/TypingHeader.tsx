"use client";

import { Typewriter } from "react-simple-typewriter";

export default function TypingHeader() {
  return (
    <h2 className="text-3xl text-text font-body font-extralight p-3">
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
  );
}
