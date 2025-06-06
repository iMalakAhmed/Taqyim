import Review from "../components/ui/Review";

import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";
import BusinessProfile from "../components/BusinessProfile";
export default function HomePage() {
  return (
    <main className="w-full h-full pt-24 p-96">
      <div className="flex flex-col">
        <UserProfile />
      </div>
    </main>
  );
}
