"use client";

import { useState } from "react";
import { useCreateReviewMutation } from "../redux/services/reviewApi";
import { useDeleteMediaMutation } from "../redux/services/mediaApi";
import MediaUpload from "./MediaUpload";
import Button from "./ui/Button";
import { IconX } from "@tabler/icons-react";
import HorizontalLine from "./ui/HorizontalLine";
import StarRating from "./ui/StarRating";
import { getFullMediaUrl } from "./MediaUpload";
import { useGetAllBusinessesQuery } from "../redux/services/BusinessApi";

type CreateReviewProps = {
  onCancel: () => void;
};

export default function CreateReview({ onCancel }: CreateReviewProps) {
  const [businessId, setBusinessId] = useState<number | "">("");
  const [productId, setProductId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [uploadedMedia, setUploadedMedia] = useState<
    { mediaId: number; filePath: string }[]
  >([]);

  const [createReview, { isLoading, error, isSuccess }] =
    useCreateReviewMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const { data: businesses = [], isLoading: isLoadingBusinesses } =
    useGetAllBusinessesQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessId || !rating || !comment) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const reviewData = {
        businessId: Number(businessId),
        productId: productId !== null ? Number(productId) : undefined,
        rating,
        comment,
        media:
          uploadedMedia.length > 0
            ? uploadedMedia.map((m) => ({ mediaId: m.mediaId }))
            : undefined,
      };

      await createReview(reviewData).unwrap();

      // Reset on success
      setBusinessId("");
      setProductId(null);
      setRating(5);
      setComment("");
      setUploadedMedia([]);
      onCancel();
    } catch (err) {
      console.error("Failed to create review:", err);
    }
  };

  const handleMediaUpload = async (mediaId: number) => {
    const res = await fetch(`/api/media/${mediaId}`);
    const media = await res.json();
    setUploadedMedia((prev) => [
      ...prev,
      { mediaId, filePath: media.filePath },
    ]);
  };

  const handleMediaDelete = async (mediaId: number) => {
    try {
      await deleteMedia(mediaId).unwrap();
      setUploadedMedia((prev) => prev.filter((m) => m.mediaId !== mediaId));
    } catch {
      alert("Failed to delete media.");
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-[9999]  text-text backdrop-invert-25"
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
          <div className="bg-background text-text">
            <label htmlFor="businessId" className="block font-medium mb-1">
              Business <span className="text-accent">*</span>
            </label>
            <select
              id="businessId"
              value={businessId}
              onChange={(e) => setBusinessId(Number(e.target.value))}
              className="w-full px-2 py-1 focus:outline-none"
              required
              disabled={isLoadingBusinesses}
            >
              <option value="">Select a business</option>
              {businesses.map((business: any) => (
                <option
                  key={business.businessId}
                  value={business.businessId}
                  className="bg-background text-text"
                >
                  {business.name}
                </option>
              ))}
            </select>
            <HorizontalLine />
          </div>

          <div>
            <label htmlFor="productId" className="block font-medium mb-1">
              Product ID (optional)
            </label>
            <input
              id="productId"
              type="number"
              value={productId === null ? "" : productId}
              onChange={(e) =>
                setProductId(
                  e.target.value === "" ? null : Number(e.target.value)
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
              onUploadSuccess={handleMediaUpload}
              onDeleteSuccess={(mediaId) =>
                setUploadedMedia((prev) =>
                  prev.filter((m) => m.mediaId !== mediaId)
                )
              }
            />
            {uploadedMedia.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {uploadedMedia.map((media) => (
                  <div
                    key={media.mediaId}
                    className="relative group w-20 h-20 rounded border overflow-hidden"
                  >
                    <img
                      src={getFullMediaUrl(media.filePath)}
                      alt="Uploaded media"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleMediaDelete(media.mediaId)}
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
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
