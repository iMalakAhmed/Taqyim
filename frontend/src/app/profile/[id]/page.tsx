import UserProfile from "../../components/UserProfile";
import HorizontalLine from "../../components/ui/HorizontalLine";
import UserReviews from "@/app/components/ui/UserReviews";
export default function ProfilePage() {
  return (
    <main className="w-full min-h-screen bg-background text-text pt-24 p-96">
      <div className="border shadow-xl">
        <UserProfile />
        <HorizontalLine />
        <UserReviews />
      </div>
    </main>
  );
}
