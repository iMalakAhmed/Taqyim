"use client";

import { useGetReviewsQuery } from "@/app/redux/services/reviewApis";

export default function Review() {
  const { data: reviews, error, isLoading } = useGetReviewsQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>There was an error :/</p>;

  return (
    <div className="space-y-6">
      {reviews?.map((review) => (
        <div
          key={review.reviewId}
          className="max-w-md p-4 border rounded shadow space-y-4"
        >
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <img
              src={review.user.profilePic || "/default-avatar.png"}
              alt={`${review.user.firstName}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <h3 className="font-semibold text-lg">
              {review.user.firstName} {review.user.lastName}
            </h3>
          </div>

          {/* Review Content */}
          <p className="text-gray-700">{review.comment}</p>

          {/* Images Section */}
          {review.images?.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto">
              {review.images.map((img) => (
                <img
                  key={img.reviewImageId}
                  src={img.imageUrl}
                  alt={img.caption || "Review image"}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
