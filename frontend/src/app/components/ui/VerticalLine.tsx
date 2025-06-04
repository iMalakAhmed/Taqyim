"use client";

import { useEffect, useRef, useState } from "react";

interface VerticalLineProps {
  className?: string;
}

export default function VerticalLine({ className = "" }: VerticalLineProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
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
      className={`
        w-px bg-text transition-all duration-700 ease-out
        ${visible ? "opacity-100" : "h-0 opacity-0"}
        ${className}
      `}
    />
  );
}
