"use client";

import { useState } from "react";
import { useCreateReviewMutation } from "../redux/services/reviewApi";
import MediaUpload from "./MediaUpload";
import Button from "./ui/Button";
import { IconX } from "@tabler/icons-react";
import HorizontalLine from "./ui/HorizontalLine";
import StarRating from "./ui/StarRating";

type CreateReviewProps = {
  onCancel: () => void;
};

export default function CreateReview({ onCancel }: CreateReviewProps) {
  const [businessId, setBusinessId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | "">("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [uploadedMediaIds, setUploadedMediaIds] = useState<number[]>([]);
  const [createReview, { isLoading, error, isSuccess }] =
    useCreateReviewMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessId || !rating || !comment) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await createReview({
        businessId: Number(businessId),
        productId: productId ? Number(productId) : undefined,
        rating,
        comment,
        mediaIds: uploadedMediaIds.length > 0 ? uploadedMediaIds : undefined,
      }).unwrap();

      // Reset form on success
      setBusinessId("");
      setProductId("");
      setRating(5);
      setComment("");
      setUploadedMediaIds([]);
      onCancel();
    } catch (err) {
      console.error("Failed to create review:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-[9999] bg-black/30 backdrop-invert-25"
      onClick={onCancel}
    >
      <div
        className="bg-background shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onCancel}
          aria-label="Close modal"
          variant="none"
          size="sm"
          className="absolute top-2 right-2 hover:text-accent"
        >
          <IconX />
        </Button>

        <h2 className="text-xl font-semibold mb-2">Create Review</h2>
        <HorizontalLine />

        <form onSubmit={handleSubmit} className="space-y-3 text-base mt-3">
          <div>
            <label htmlFor="businessId" className="block font-medium mb-1">
              Business ID <span className="text-accent">*</span>
            </label>
            <input
              id="businessId"
              type="number"
              value={businessId}
              onChange={(e) =>
                setBusinessId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-2 py-1 focus:outline-none"
              required
              min={1}
            />
            <HorizontalLine />
          </div>

          <div>
            <label htmlFor="productId" className="block font-medium mb-1">
              Product ID (optional)
            </label>
            <input
              id="productId"
              type="number"
              value={productId}
              onChange={(e) =>
                setProductId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-2 py-1 focus:outline-none"
              min={1}
            />
            <HorizontalLine />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Rating (1–5) <span className="text-accent">*</span>
            </label>
            <StarRating rating={rating} onChange={setRating} />
            <HorizontalLine className="mt-3" />
          </div>

          <div>
            <label htmlFor="comment" className="block font-medium mb-1">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-2 py-1 focus:outline-none resize-none"
              required
            />
            <HorizontalLine />
          </div>

          <div>
            <label className="block font-medium mb-1">Upload Media</label>
            <MediaUpload
              onUploadSuccess={(mediaId) =>
                setUploadedMediaIds((prev) => [...prev, mediaId])
              }
            />
            {uploadedMediaIds.length > 0 && (
              <p className="text-sm mt-2 text-secondary">
                Uploaded Media IDs: {uploadedMediaIds.join(", ")}
              </p>
            )}
            <HorizontalLine />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="md"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>

        {isSuccess && (
          <p className="mt-3 text-secondary font-medium text-sm">
            Review created successfully!
          </p>
        )}
        {error && (
          <p className="mt-3 text-accent font-medium text-sm">
            Failed to create review. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
