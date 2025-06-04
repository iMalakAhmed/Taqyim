import HorizontalLine from "../components/ui/HorizontalLine";
import SideNav from "../components/ui/SideNav";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text">
      <main className="">
        <HorizontalLine className="fixed top-24 left-0 w-64 z-50" />
        <SideNav />
        {children}
      </main>
    </div>
  );
}
