import BusinessAnalyticsSection from "@/app/components/BusinessAnalyticsSection";
import BusinessProfile from "../../components/BusinessProfile";
import BusinessReviews from "@/app/components/ui/BusinessReviews";
export default function ProfilePage() {
  return (
    <main className="w-full min-h-screen bg-background text-text  pt-24 p-96">
      <div className="">
        <BusinessProfile />
        <BusinessAnalyticsSection />
        <BusinessReviews />
      </div>
    </main>
  );
}