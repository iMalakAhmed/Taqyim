import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./redux/provider";
import NavBar from "./components/ui/NavBar";

export const metadata: Metadata = {
  title: "Taqyim",
  description: "A business review app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
