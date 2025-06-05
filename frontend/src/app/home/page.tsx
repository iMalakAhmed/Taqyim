import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";
import BusinessProfile from "../components/BusinessProfile";
export default function HomePage() {
  return (
    <main className="w-full min-h-screen pt-24 p-96">
      <BusinessProfile />
      <HorizontalLine className="w-screen" />
    </main>
  );
}
