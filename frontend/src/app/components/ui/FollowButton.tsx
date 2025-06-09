"use client";

import { useState ,useEffect } from "react";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/app/redux/services/connectionApi";

type FollowButtonProps = {
  followingId: number;
  followingType: "User" | "Business";
  isInitiallyFollowing: boolean;
  className?: string;
  onToggle?: (newState: boolean) => void;
};

export default function FollowButton({
  followingId,
  followingType,
  isInitiallyFollowing,
  className,
  onToggle,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation();

  // ✅ Sync with parent state when prop changes (important)
  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  const handleToggleFollow = async () => {
    try {
      if (isFollowing) {
        await unfollowUser({ followingId, followingType }).unwrap();
        setIsFollowing(false);
        setFeedback("Unfollowed");
        onToggle?.(false);
      } else {
        await followUser({ followingId, followingType }).unwrap();
        setIsFollowing(true);
        setFeedback("Followed");
        onToggle?.(true);
      }

      setTimeout(() => setFeedback(null), 2000);
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      setFeedback("Error");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={isFollowingLoading || isUnfollowingLoading}
      className={`relative ${className ?? ""}`}
      type="button"
    >
      {isFollowing ? "Unfollow" : "Follow"}
      {feedback && (
        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 select-none pointer-events-none">
          {feedback}
        </span>
      )}
    </button>
  );
}
