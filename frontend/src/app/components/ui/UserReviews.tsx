"use client";

import { useParams } from "next/navigation";
import { useGetReviewsQuery } from "@/app/redux/services/reviewApi";
import ReviewCard from "./ReviewCard";
import { motion } from "framer-motion";
import { IconNote } from "@tabler/icons-react";

export default function UserReviews() {
  const { id } = useParams();
  const userId = parseInt(id as string);
  const { data: reviews, error, isLoading } = useGetReviewsQuery();

  const userReviews = reviews?.filter(
    (review) => review.user.userId === userId
  );

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-3xl font-bold font-heading text-text px-5">
        User's Reviews
      </h2>

      {userReviews && userReviews.length > 0 ? (
        <div className="space-y-4">
          {userReviews.map((review, index) => (
            <motion.div
              key={review.reviewId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <ReviewCard
                reviewId={review.reviewId}
                className="hover:shadow-md transition-shadow duration-200"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <div className="p-4 rounded-full bg-gray-100 mb-3">
            <IconNote size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">
            This user hasn't written any reviews yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates
          </p>
        </motion.div>
      )}
    </div>
  );
}
