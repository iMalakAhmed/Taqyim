"use client";

import { useState } from "react";

type CopyToClipboardButtonProps = {
  children: React.ReactNode; // e.g. your Icon component or any button content
  className?: string;
  copyText?: string; // text to copy, default to window.location.href
  variant?: "default" | "primary" | "secondary"; // optional variant prop for styling
};

export default function CopyToClipboardButton({
  children,
  className,
  copyText,
  variant,
}: CopyToClipboardButtonProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = copyText || window.location.href;
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative  ${className ?? ""}`}
      type="button"
      aria-label="Copy URL"
    >
      {children}
      {copySuccess && (
        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-text text-background text-xs rounded px-2 py-1 select-none pointer-events-none z-50 transition-opacity duration-300 opacity-100">
          Copied!
        </span>
      )}
    </button>
  );
}
