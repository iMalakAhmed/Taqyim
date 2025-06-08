"use client";

import { useState } from "react";

type CopyToClipboardButtonProps = {
  children: React.ReactNode; // e.g. your Icon component or any button content
  className?: string;
  copyText?: string; // text to copy, default to window.location.href
};

export default function CopyToClipboardButton({
  children,
  className,
  copyText,
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
      className={`relative ${className ?? ""}`}
      type="button"
      aria-label="Copy URL"
    >
      {children}
      {copySuccess && (
        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 select-none pointer-events-none">
          Copied!
        </span>
      )}
    </button>
  );
}
