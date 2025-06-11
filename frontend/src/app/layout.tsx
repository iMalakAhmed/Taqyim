import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./redux/provider";
import NavBar from "./components/ui/NavBar";
import "leaflet/dist/leaflet.css";
import SideNav from "./components/ui/SideNav";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <NavBar />
          <SideNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
