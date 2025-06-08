import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";
export default function ProfilePage() {
  return (
    <main className="w-full min-h-screen pt-24 p-96">
      <div className="">
        <UserProfile />
      </div>
    </main>
  );
}
// This page serves as the main profile page for the user.