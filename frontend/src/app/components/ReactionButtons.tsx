"use client";

import { IconThumbUp } from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import {
  useReactToReviewMutation,
  useGetUserReactionForReviewQuery,
  useDeleteReactionMutation,
} from "../redux/services/reactionApi";
import Button from "./ui/Button"; // adjust path if needed
import clsx from "clsx";
import { useDispatch, useSelector } from "react-redux";
import {
  setReactionCount,
  incrementReactionCount,
  decrementReactionCount,
} from "./../redux/slices/reactionCounterSlice";
import { reactionsList } from "../utils/reactionList";
import { RootState } from "../redux/store";

export default function ReactionButtons({
  reviewId,
  reactionCount,
}: {
  reviewId: number;
  reactionCount: number;
}) {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const {
    data: reactionData,
    isLoading: isReactionLoading,
    refetch,
  } = useGetUserReactionForReviewQuery(reviewId);

  useEffect(() => {
    refetch();
    setSelectedReaction(null);
  }, [userId, refetch]);

  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactToReview, { isLoading: isReacting }] = useReactToReviewMutation();
  const [deleteReaction, { isLoading: isDeleting }] =
    useDeleteReactionMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setReactionCount({ reviewId, count: reactionCount }));
  }, [dispatch, reactionCount]);

  useEffect(() => {
    if (reactionData && reactionData.reactionType) {
      setSelectedReaction(reactionData.reactionType);
    } else {
      setSelectedReaction(null);
    }
  }, [reactionData]);

  const handleReactionClick = async (type: string) => {
    if (type === selectedReaction && reactionData) {
      try {
        await deleteReaction(reactionData.reactionId).unwrap();
        setSelectedReaction(null);
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
            dispatch(incrementReactionCount(reviewId));
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
        paddingTop: 0,
        paddingBottom: 5,
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      {/* <span>
        {localReactionCount} Reaction{localReactionCount !== 1 ? "s" : ""}
      </span> */}

      <Button
        variant="none"
        size="sm"
        className="hover:text-secondary"
        disabled={isReacting || isDeleting || isReactionLoading}
        iconLeft={selected ? <selected.icon size={20} /> : undefined}
        onClick={async () => {
          if (selectedReaction && reactionData) {
            try {
              await deleteReaction(reactionData.reactionId).unwrap();
              setSelectedReaction(null);
              dispatch(decrementReactionCount(reviewId));
            } catch (error) {
              console.error("Failed to delete reaction", error);
            }
          } else {
            setIsPinned(!isPinned);
            setIsOpen(true);
          }
        }}
      >
        {selected ? (
          selected.label
        ) : (
          <IconThumbUp size={20} className="text-text hover:text-secondary" />
        )}
      </Button>

      {isOpen && (
        <div
          className="absolute left-0 bottom-10 flex bg-background border border-text shadow-lg p-1 z-50 gap-2"
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
