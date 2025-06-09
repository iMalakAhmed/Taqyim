"use client";

import { useState, useEffect } from "react";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
} from "@/app/redux/services/connectionApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/userApi";
import Button from "./Button";

type FollowButtonProps = {
  followingId: number;
  followingType: "User" | "Business";
  className?: string;
  onToggle?: (newState: boolean) => void;
};

export default function FollowButton({
  followingId,
  followingType,
  className,
  onToggle,
}: FollowButtonProps) {
  const { data: currentUser } = useGetCurrentUserQuery();
  const {
    data: followers = [],
    isLoading: followersLoading,
    refetch,
  } = useGetFollowersQuery(
    { id: followingId, type: followingType },
    { skip: !followingId }
  );

  const [isFollowing, setIsFollowing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [followUser, { isLoading: isFollowingLoading }] =
    useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoading }] =
    useUnfollowUserMutation();

  // ⏳ Sync isFollowing once followers are loaded
  useEffect(() => {
    if (currentUser && followers.length > 0) {
      const isFollowed = followers.some((f) => f.userId === currentUser.userId);
      setIsFollowing(isFollowed);
    }
  }, [followers, currentUser]);

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
      refetch(); // ensure UI sync
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      setFeedback("Error");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        handleToggleFollow();
      }}
      disabled={isFollowingLoading || isUnfollowingLoading || followersLoading}
      size="md"
      variant="secondary"
      className={`relative ${className ?? ""}`}
      type="button"
    >
      {isFollowing ? "Unfollow" : "Follow"}
      {feedback && (
        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 select-none pointer-events-none">
          {feedback}
        </span>
      )}
    </Button>
  );
}
