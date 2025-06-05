"use client";

import {
  IconThumbUp,
  IconHeart,
  IconMoodXd,
  IconMoodSurprised,
  IconThumbDown,
  IconFlame,
  IconEyeSearch,
  IconCertificate,
} from "@tabler/icons-react";
import { useState } from "react";
import { useReactToReviewMutation } from "../redux/services/reactionApi";

const reactionsList = [
  { type: "like", label: "Like", icon: IconThumbUp },
  { type: "love", label: "Love", icon: IconHeart },
  { type: "funny", label: "Funny", icon: IconMoodXd },
  { type: "surprised", label: "Surprised", icon: IconMoodSurprised },
  { type: "dislike", label: "Dislike", icon: IconThumbDown },
  { type: "helpful", label: "Helpful", icon: IconFlame },
  { type: "detailed", label: "Detailed", icon: IconEyeSearch },
  { type: "accurate", label: "Accurate", icon: IconCertificate },
];

export default function ReactionButtons({
  reviewId,
  token,
}: {
  reviewId: number;
  token: string;
}) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactToReview, { isLoading }] = useReactToReviewMutation();

  const handleReactionClick = async (type: string) => {
    try {
      const result = await reactToReview({
        reviewId,
        reactionType: type,
      }).unwrap();

      // Optional: adjust based on whether server returns the same or null
      if (!result || result.reactionType === selectedReaction) {
        setSelectedReaction(null); // removed
      } else {
        setSelectedReaction(type); // added or changed
      }
    } catch (error) {
      console.error("Reaction error:", error);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {reactionsList.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => handleReactionClick(type)}
          className={`flex items-center gap-1 px-3 py-2 rounded-full border text-sm font-medium transition-all
            ${
              selectedReaction === type
                ? "bg-accent text-white border-accent"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }
          `}
          disabled={isLoading}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
}
