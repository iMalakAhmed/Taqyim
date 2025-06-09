import UserProfile from "../../components/UserProfile";
import HorizontalLine from "../../components/ui/HorizontalLine";
export default function ProfilePage() {
  return (
    <main className="w-full min-h-screen bg-background pt-24 p-96">
      <div className="">
        <UserProfile />
        <HorizontalLine />
      </div>
    </main>
  );
}
