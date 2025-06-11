"use client";

import { useGetBusinessAnalyticsQuery } from "@/app/redux/services/analyticsApi";
import { useParams } from "next/navigation";

export default function BusinessAnalyticsSection() {
  const params = useParams();
  const businessId = parseInt(params.id as string, 10);
  const { data, isLoading, isError } = useGetBusinessAnalyticsQuery(businessId);

  if (isLoading) return <p className="text-gray-500">Loading analytics...</p>;
  if (isError || !data)
    return <p className="text-red-500">Failed to load analytics.</p>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-4">Business Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-lg font-bold">Total Reviews</p>
          <p>{data.totalReviews}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-lg font-bold">Average Rating</p>
          <p>{data.averageRating.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-lg font-bold">Followers</p>
          <p>{data.followerCount}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-lg font-bold">Media Uploaded</p>
          <p>{data.totalMediaCount}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-medium mb-2">Top Reviewers</h3>
        <ul className="space-y-2">
          {data.topReviewers.map((reviewer) => (
            <li
              key={reviewer.userId}
              className="flex justify-between p-2 bg-gray-50 rounded-lg"
            >
              <span>{reviewer.username}</span>
              <span>
                {reviewer.reviewCount} reviews (
                {reviewer.averageRatingGiven.toFixed(1)}★)
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-medium mb-2">Sentiment Breakdown</h3>
        <ul className="space-y-1">
          {Object.entries(data.sentimentBreakdown).map(([label, count]) => (
            <li key={label}>
              {label}: {count}
            </li>
          ))}
        </ul>
      </div>

      {data.mostLikedReview && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold mb-1">Most Liked Review</h4>
          <p className="text-gray-700 italic">
            “{data.mostLikedReview.commentSnippet}”
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Reactions: {data.mostLikedReview.reactionCount}
          </p>
        </div>
      )}
    </div>
  );
}
