import { useGetSavedReviewsQuery } from "../redux/services/savedReviewsApi";
import ReviewCard from "./ui/ReviewCard";

export default function SavedReviewsFeed() {
  const { data: savedReviewsData, isLoading, error } = useGetSavedReviewsQuery({});

  if (isLoading) {
    return <div>Loading saved reviews...</div>;
  }

  if (error) {
    return <div>Error loading saved reviews.</div>;
  }

  if (!savedReviewsData || savedReviewsData.items.length === 0) {
    return <div className="text-center text-text-light mt-8">No saved reviews found.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {savedReviewsData.items.map((savedReview) => (
        <ReviewCard key={savedReview.savedReviewId} reviewId={savedReview.reviewId} />
      ))}
    </div>
  );
} 