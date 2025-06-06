import Review from "../components/ui/Review";
import { UsersList } from "../components/UserList";

import UserProfile from "../components/UserProfile";
import HorizontalLine from "../components/ui/HorizontalLine";
import BusinessProfile from "../components/BusinessProfile";
export default function HomePage() {
  return (
    <main className="w-full min-h-screen pt-24 p-96">
      <div className="">
        <Review />
        <UsersList />
      </div>
    </main>
  );
}
