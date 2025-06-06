import BusinessProfile from "../components/BusinessProfile";
import Feed from "../components/Feed";
import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen pt-24 p-96">
      <div className="">
        <BusinessProfile />
      </div>
    </main>
  );
}
