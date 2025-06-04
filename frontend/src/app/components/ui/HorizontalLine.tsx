"use client";

import { useEffect, useRef, useState } from "react";

export default function HorizontalLine() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // Trigger only once
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`h-px bg-text transition-all duration-700 ease-out ${
        visible ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}
