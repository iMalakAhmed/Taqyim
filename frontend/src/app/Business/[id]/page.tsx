import BusinessAnalyticsSection from "@/app/components/BusinessAnalyticsSection";
import BusinessProfile from "../../components/BusinessProfile";
export default function ProfilePage() {
  return (
    <main className="w-full min-h-screen pt-24 p-96">
      <div className="">
        <BusinessProfile />
        <BusinessAnalyticsSection />
      </div>
    </main>
  );
}
// This page serves as the main profile page for the user.
