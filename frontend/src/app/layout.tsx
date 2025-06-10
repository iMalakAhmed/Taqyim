import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/ui/NavBar";
import SideNav from "./components/ui/SideNav";
import HorizontalLine from "./components/ui/HorizontalLine";
import { inter } from "./fonts/inter";
import Providers from "./components/Providers";

export const metadata: Metadata = {
  title: "Taqyim",
  description: "Your trusted review platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          <NavBar />
          <HorizontalLine className="fixed top-24 left-0 w-full z-50" />
          <div className="flex pt-24 min-h-[calc(100vh-6rem)]">
            <SideNav className="w-96" />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
