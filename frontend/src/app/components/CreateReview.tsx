"use client";

import { useState } from "react";
import { useCreateReviewMutation } from "../redux/services/reviewApi";

export default function CreateReview() {
  const [businessId, setBusinessId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState("");
  const [createReview, { isLoading, error, isSuccess }] =
    useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare tags array if tags input is filled
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Create Review</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessId" className="block font-medium mb-1">
            Business ID <span className="text-red-500">*</span>
          </label>
          <input
            id="businessId"
            type="number"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="comment" className="block font-medium mb-1">
            Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      {isSuccess && (
        <p className="mt-4 text-green-600 font-medium">
          Review created successfully!
        </p>
      )}
      {error && (
        <p className="mt-4 text-red-600 font-medium">
          Failed to create review. Please try again.
        </p>
      )}
    </div>
  );
}
