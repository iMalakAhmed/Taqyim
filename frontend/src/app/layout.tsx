import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./redux/provider";
import NavBar from "./components/ui/NavBar";
import "leaflet/dist/leaflet.css";
import SideNav from "./components/ui/SideNav";
import HorizontalLine from "./components/ui/HorizontalLine";

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
          {/* <HorizontalLine className="fixed top-24 left-0 w-64 z-50" /> */}
          <SideNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
