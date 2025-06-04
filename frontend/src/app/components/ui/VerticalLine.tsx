"use client";
import { useEffect, useState } from "react";

interface VerticalLineProps {
  className?: string;
}

export default function VerticalLine({ className = "" }: VerticalLineProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
  }, []);

  return (
    <div
      className={`
        w-px bg-text transition-all duration-700 ease-out
        ${visible ? "opacity-100" : "h-0 opacity-0"}
        ${className}
      `}
    />
  );
}
