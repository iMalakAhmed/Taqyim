// app/home/layout.tsx
import React from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text">
      <main className="p-8">{children}</main>
    </div>
  );
}
