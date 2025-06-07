"use client";

import { useState } from "react";
import { useCreateReviewMutation } from "../redux/services/reviewApi";
import MediaUpload from "./MediaUpload";

type CreateReviewProps = {
  onCancel: () => void;
};

export default function CreateReview({ onCancel }: CreateReviewProps) {
  const [businessId, setBusinessId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [createReview, { isLoading, error, isSuccess }] =
    useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!businessId || !rating || !comment) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await createReview({
        businessId: Number(businessId),
        rating,
        comment,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      }).unwrap();

      // Reset form on success
      setBusinessId("");
      setRating(5);
      setComment("");
      setTags("");
    } catch (err) {
      console.error("Failed to create review:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-4 w-full max-w-[480px] max-h-[360px] relative overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ minHeight: "280px" }}
      >
        <button
          onClick={onCancel}
          aria-label="Close modal"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Create Review</h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label htmlFor="businessId" className="block font-medium mb-1">
              Business ID <span className="text-red-500">*</span>
            </label>
            <input
              id="businessId"
              type="number"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min={1}
            />
          </div>

          <div>
            <label htmlFor="rating" className="block font-medium mb-1">
              Rating (1-5) <span className="text-red-500">*</span>
            </label>
            <input
              id="rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="comment" className="block font-medium mb-1">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              rows={2} // less height
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label htmlFor="tags" className="block font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. friendly, quick, clean"
              className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded disabled:opacity-50 text-sm"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {isSuccess && (
          <p className="mt-3 text-green-600 font-medium text-sm">
            Review created successfully!
          </p>
        )}
        {error && (
          <p className="mt-3 text-red-600 font-medium text-sm">
            Failed to create review. Please try again.
          </p>
        )}

        <div className="mt-4">
          <MediaUpload />
        </div>
      </div>
    </div>
  );
}
