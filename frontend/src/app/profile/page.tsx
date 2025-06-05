import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <UserProfile />
      <HorizontalLine className="my-8" />
    </div>
  );
}
// This page serves as the main profile page for the user.