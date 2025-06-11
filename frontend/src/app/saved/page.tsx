"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useGetSavedReviewsQuery,
  useSaveReviewMutation,
  useUnsaveReviewMutation,
} from "@/app/redux/services/savedReviewApi";
import {
  useGetCurrentUserQuery,
  useGetUserQuery,
} from "@/app/redux/services/userApi";
import { formatTimestamp } from "@/app/components/ui/FormatTimeStamp";
import {
  IconStarFilled,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";

export default function SavedReviewsPage() {
  const params = useParams();
  const viewedId = params?.id as string | undefined;

  const {
    data: currentUser,
    isLoading: isCurrentLoading,
    error: currentError,
  } = useGetCurrentUserQuery();

  const {
    data: viewedUser,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserQuery(Number(viewedId), {
    skip: !viewedId || viewedId === "me",
  });

  const user = viewedId && viewedId !== "me" ? viewedUser : currentUser;
  const isLoading =
    viewedId && viewedId !== "me" ? isUserLoading : isCurrentLoading;
  const error = viewedId && viewedId !== "me" ? userError : currentError;

  const userId = user?.userId;

  const {
    data: savedReviews,
    isLoading: isSavedLoading,
    isError,
    refetch: refetchSavedReviews,
  } = useGetSavedReviewsQuery(userId!, {
    skip: !userId,
  });

  // Mutation hooks for save/unsave
  const [saveReview] = useSaveReviewMutation();
  const [unsaveReview] = useUnsaveReviewMutation();

  // Track saving state per review ID
  const [savingIds, setSavingIds] = useState<number[]>([]);

  useEffect(() => {
    if (viewedId && viewedId !== "me") {
      refetchUser();
    }
  }, [viewedId]);

  if (isLoading || isSavedLoading)
    return (
      <div className="p-6 text-center font-serif text-gray-700">
        Loading saved articles...
      </div>
    );
  if (!user || error || isError) return notFound();

  // Handler to toggle saved state (unsave in this case since we are on saved page)
  const toggleSave = async (reviewId: number) => {
    if (!userId) return;

    if (savingIds.includes(reviewId)) return; // prevent multiple clicks

    setSavingIds((ids) => [...ids, reviewId]);

    try {
      // Since these are saved reviews, toggle means unsave
      await unsaveReview({ reviewId, userId }).unwrap();
      await refetchSavedReviews(); // refresh the list after unsave
    } catch (err) {
      console.error("Failed to unsave review", err);
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== reviewId));
    }
  };

  return (
    <main className="ml-[250px] px-6 py-10 font-serif bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold border-b-[3px] border-gray-300 pb-6 mb-10 text-center">
          <span className="text-primary italic">{user.userName}</span>'s Saved
          Articles
        </h1>

        {savedReviews?.length === 0 ? (
          <p className="text-lg text-center text-gray-500 italic">
            You haven’t saved any reviews yet. Start reading and bookmarking!
          </p>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {savedReviews?.map((review) => (
              <article
                key={review.reviewId}
                className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-md transition-all duration-300 p-6 space-y-3 relative"
              >
                {/* Header */}
                <header className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900">
                    {review.comments[0]?.content ||
                      review.comment ||
                      "(No Title)"}
                  </h2>
                  <div className="text-sm text-gray-600">
                    <span className="inline-flex items-center mr-3">
                      <IconStarFilled
                        size={16}
                        className="text-yellow-500 mr-1"
                      />
                      {review.rating} / 5
                    </span>
                    <span>• Saved on {formatTimestamp(review.createdAt)}</span>
                  </div>
                </header>

                {/* Body */}
                <p className="text-gray-700 text-sm italic line-clamp-4">
                  {review.comment}
                </p>

                {/* Footer */}
                <footer className="text-sm text-blue-600 flex flex-col space-y-1">
                  <span className="font-medium text-gray-800">
                    Business: {review.business?.name ?? "Unknown"}
                  </span>
                  <span className="text-gray-500">
                    Posted by {review.user?.userName ?? "Anonymous"}
                  </span>
                  <Link
                    href={`/reviews/${review.reviewId}`}
                    className="hover:underline text-blue-700 font-medium mt-1"
                  >
                    → Read Full Review
                  </Link>
                  <Link
                    href={`/business/${review.businessId}`}
                    className="hover:underline text-sm text-blue-500"
                  >
                    → View Business
                  </Link>
                </footer>

                {/* Unsave Button */}
                <button
                  onClick={() => toggleSave(review.reviewId)}
                  disabled={savingIds.includes(review.reviewId)}
                  className={`absolute top-4 right-4 p-2 rounded-full focus:outline-none ${
                    savingIds.includes(review.reviewId)
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-accent hover:text-accent-dark"
                  }`}
                  aria-label="Unsave review"
                  title="Unsave review"
                >
                  <IconBookmarkFilled size={24} />
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
