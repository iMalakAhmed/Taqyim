"use client";

import { useState, useEffect } from "react";
import { useGetReviewsQuery } from "../redux/services/reviewApi";
import Review from "./ui/ReviewCard";
import { ReviewType } from "../redux/services/types";

export default function Feed() {
  const PAGE_SIZE = 10;

  const [page, setPage] = useState(1);
  const [allReviews, setAllReviews] = useState<ReviewType[]>([]);

  const { data, error, isLoading, isFetching } = useGetReviewsQuery({
    page,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (data?.items) {
      setAllReviews((prev) => [...prev, ...data.items]);
    }
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        !isFetching &&
        data?.items.length === PAGE_SIZE
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, data]);

  if (isLoading && page === 1) return <p>Loading reviews...</p>;
  if (error) return <p>Failed to load reviews.</p>;

  return (
    <div className="w-screen">
      {allReviews.length === 0 && <p>No reviews found.</p>}

      {allReviews.map((review) => (
        <Review key={review.reviewId} reviewId={review.reviewId} />
      ))}

      {isFetching && <p>Loading more reviews...</p>}
    </div>
  );
}
