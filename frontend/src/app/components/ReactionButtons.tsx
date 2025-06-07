"use client";

import {
  IconThumbUp,
  IconHeart,
  IconMoodSurprised,
  IconThumbDown,
  IconFlame,
  IconEyeSearch,
  IconCertificate,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import {
  useReactToReviewMutation,
  useGetUserReactionForReviewQuery,
  useDeleteReactionMutation,
} from "../redux/services/reactionApi";
import Button from "./ui/Button"; // adjust path if needed
import clsx from "clsx";

const reactionsList = [
  { type: "like", label: "Like", icon: IconThumbUp },
  { type: "love", label: "Love", icon: IconHeart },
  { type: "surprised", label: "Surprised", icon: IconMoodSurprised },
  { type: "dislike", label: "Dislike", icon: IconThumbDown },
  { type: "helpful", label: "Helpful", icon: IconFlame },
  { type: "detailed", label: "Detailed", icon: IconEyeSearch },
  { type: "accurate", label: "Accurate", icon: IconCertificate },
];

export default function ReactionButtons({
  reviewId,
  reactionCount,
}: {
  reviewId: number;
  reactionCount: number;
}) {
  const { data: reactionData, isLoading: isReactionLoading } =
    useGetUserReactionForReviewQuery(reviewId);

  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactToReview, { isLoading: isReacting }] = useReactToReviewMutation();
  const [deleteReaction, { isLoading: isDeleting }] =
    useDeleteReactionMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [localReactionCount, setLocalReactionCount] =
    useState<number>(reactionCount);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reactionData && reactionData.reactionType) {
      setSelectedReaction(reactionData.reactionType);
    } else {
      setSelectedReaction(null);
    }
  }, [reactionData]);

  useEffect(() => {
    setLocalReactionCount(reactionCount);
  }, [reactionCount]);

  const handleReactionClick = async (type: string) => {
    if (type === selectedReaction && reactionData) {
      try {
        await deleteReaction(reactionData.reactionId).unwrap();
        setSelectedReaction(null);
        setLocalReactionCount((count) => Math.max(0, count - 1)); // decrement count on delete
      } catch (error) {
        console.error("Failed to delete reaction", error);
      }
    } else {
      try {
        const result = await reactToReview({
          reviewId,
          reactionType: type,
        }).unwrap();

        if (result) {
          if (!selectedReaction) {
            // user is adding a reaction for the first time
            setLocalReactionCount((count) => count + 1);
          }
          // if user changed reaction type, count stays the same

          setSelectedReaction(result.reactionType);
        }
      } catch (error) {
        console.error("Reaction error:", error);
      }
    }
    setIsOpen(false);
    setIsPinned(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsPinned(false);
        setHovered(null);
      }
    }
    if (isPinned) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPinned]);

  const selected = reactionsList.find((r) => r.type === selectedReaction);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => {
        if (!isPinned) setIsOpen(true);
      }}
      onMouseLeave={() => {
        if (!isPinned) {
          setIsOpen(false);
          setHovered(null);
        }
      }}
      style={{
        paddingTop: 20,
        paddingBottom: 30,
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      <span>
        {localReactionCount} Reaction{localReactionCount !== 1 ? "s" : ""}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={isReacting || isDeleting || isReactionLoading}
        iconLeft={selected ? <selected.icon size={18} /> : undefined}
        onClick={async () => {
          if (selectedReaction && reactionData) {
            try {
              await deleteReaction(reactionData.reactionId).unwrap();
              setSelectedReaction(null);
              setLocalReactionCount((count) => Math.max(0, count - 1)); // <-- Add this
            } catch (error) {
              console.error("Failed to delete reaction", error);
            }
          } else {
            setIsPinned(!isPinned);
            setIsOpen(true);
          }
        }}
      >
        {selected ? selected.label : "React"}
      </Button>

      {isOpen && (
        <div
          className="absolute left-0 mt-2 flex bg-background border border-text rounded-xl shadow-lg p-2 z-50 gap-2"
          style={{ pointerEvents: "auto" }}
          onMouseEnter={() => {
            if (!isPinned) setIsOpen(true);
          }}
          onMouseLeave={() => {
            if (!isPinned) {
              setIsOpen(false);
              setHovered(null);
            }
          }}
        >
          {reactionsList.map(({ type, label, icon: Icon }) => {
            const isHovered = hovered === type;

            return (
              <div
                key={type}
                onMouseEnter={() => setHovered(type)}
                onMouseLeave={() => setHovered(null)}
                className={clsx(
                  "transition-transform duration-200 ease-in-out",
                  hovered
                    ? isHovered
                      ? "scale-125 z-10"
                      : "scale-90"
                    : "scale-100"
                )}
              >
                <Button
                  variant={selectedReaction === type ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleReactionClick(type)}
                  iconLeft={<Icon size={18} />}
                  disabled={isReacting || isDeleting || isReactionLoading}
                >
                  {label}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
