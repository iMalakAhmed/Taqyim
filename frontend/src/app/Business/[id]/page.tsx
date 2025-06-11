import BusinessAnalyticsDashboard from "@/app/components/BusinessAnalyticsChart";
// import BusinessAnalyticsSection from "@/app/components/BusinessAnalyticsSection";
import BusinessProfile from "../../components/BusinessProfile";
export default function ProfilePage() {
  return (
    <main className="w-full min-h-screen bg-background text-text  pt-24 p-96">
      <div className="">
        <BusinessProfile />
        {/* <BusinessAnalyticsSection /> */}
        <div className="max-w-5xl mx-auto px-4">
          <BusinessAnalyticsDashboard />
        </div>
      </div>
    </main>
  );
}
// This page serves as the main profile page for the user.
