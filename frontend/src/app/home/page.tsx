import Review from "../components/ui/Review";

import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";
import BusinessProfile from "../components/BusinessProfile";
export default function HomePage() {
  return (
    <main className="w-full min-h-screen pt-24 p-96">
      <div className="flex flex-col items-center">
        <UserProfile />
        <HorizontalLine className="my-8" />
        <BusinessProfile />
        <HorizontalLine className="my-8" />
        <Review />
      </div>
    </main>
  );
}
