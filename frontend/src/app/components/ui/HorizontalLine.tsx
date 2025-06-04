"use client";

import { useEffect, useState } from "react";

export default function HorizontalLine() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 5);
  }, []);

  return (
    <div
      className={`h-px bg-text transition-all duration-700 ease-out ${
        visible ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}
