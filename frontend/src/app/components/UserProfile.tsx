"use client";

import { useEffect, useState } from "react";
import EditProfileModal from "@/app/components/ui/EditProfileModal";
import Button from "@/app/components/ui/Button";
import {
  useGetCurrentUserQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/app/redux/services/userApi";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
} from "@/app/redux/services/connectionApi";
import { IconEdit, IconShare, IconTrash } from "@tabler/icons-react";
import { useParams, useRouter, notFound } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { authApi } from "@/app/redux/services/authApi";
import { removeAuthCookie } from "@/app/actions/auth";
import CopyToClipboardButton from "@/app/components/ui/ShareButton";
import FollowButton from "@/app/components/ui/FollowButton";
import HorizontalLine from "./ui/HorizontalLine";

const UserProfile = () => {
  const params = useParams();
  const viewedId = params?.id as string | undefined;

  const {
    data: currentUser,
    isLoading: isCurrentLoading,
    error: currentError,
  } = useGetCurrentUserQuery();

  const {
    data: viewedUser,
    isLoading: isUserLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserQuery(Number(viewedId), {
    skip: !viewedId || viewedId === "me",
  });

  const user = viewedId && viewedId !== "me" ? viewedUser : currentUser;

  const { data: followers = [], refetch: refetchFollowers } =
    useGetFollowersQuery(
      { id: Number(user?.userId ?? 0), type: "User" },
      { skip: !user?.userId }
    );
  const { data: followings = [], refetch: refetchFollowings } =
    useGetFollowingQuery(
      { id: Number(user?.userId ?? 0), type: "User" },
      { skip: !user?.userId }
    );

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const isLoading =
    viewedId && viewedId !== "me" ? isUserLoading : isCurrentLoading;
  const error = viewedId && viewedId !== "me" ? userError : currentError;
  const isSelf =
    !viewedId ||
    viewedId === "me" ||
    (currentUser && Number(viewedId) === currentUser.userId);

  const [isFollowing, setIsFollowing] = useState(
    followers?.some((f) => f.userId === currentUser?.userId) ?? false
  );

  useEffect(() => {
    if (viewedId && viewedId !== "me") {
      refetchUser();
    }
  }, [viewedId]);

  useEffect(() => {
    setIsFollowing(
      followers?.some((f) => f.userId === currentUser?.userId) ?? false
    );
  }, [followers, currentUser]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this user?")) {
      if (!user) {
        toast.error("User not found");
        return;
      }
      try {
        await deleteUser(user.userId);
        await fetch("/api/auth/signout", { method: "POST" });
        await removeAuthCookie();
        dispatch(authApi.util.resetApiState());
        toast.success("User deleted successfully");
        router.push("/auth/login");
      } catch (err) {
        console.error("Delete failed", err);
        toast.error("Failed to delete user");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !user) return notFound();

  return (
    <div className="w-full h-full flex flex-row bg-background text-text justify-center py-10">
      {/* Left: Profile Image */}
      <div className="w-1/3 flex justify-center items-start">
        <img
          src={
            user.profilePic && user.profilePic.trim() !== ""
              ? user.profilePic
              : "/default-profile.jpg"
          }
          alt={user.userName}
          className="w-36 h-48 object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/default-profile.jpg";
          }}
        />
      </div>

      {/* Right: Details */}
      <div className="w-2/3 flex flex-col font-body py-2">
        {/* Username and Follow button */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-heading font-bold">{user.userName}</h2>
        </div>

        {/* Counts: followers, following, reviews */}
        <div className="flex flex-row space-x-4 mt-2 text-sm text-text">
          <p>{followers?.length ?? 0} followers</p>
          <p>{followings?.length ?? 0} following</p>
          <p>{user.reviews?.length ?? 0} reviews</p>
        </div>
        <div className="flex flex-row flex-wrap items-center mt-4 space-x-2">
          {/* Show Follow if NOT self */}
          {!isSelf && currentUser && (
            <FollowButton
              followingId={user.userId}
              followingType="User"
              onToggle={refetchFollowers}
            />
          )}

          {/* Show Edit and Delete if self */}
          {isSelf && (
            <>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                size="sm"
                className="flex items-center space-x-1"
              >
                <IconEdit stroke={2} />
                <span>Edit profile</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                onClick={handleDelete}
              >
                <IconTrash stroke={2} />
                <span>Delete profile</span>
              </Button>
            </>
          )}

          {/* Always show Share */}
          <CopyToClipboardButton
            copyText={`https://localhost:3000/profile/${user.userId}`}
            className="hover:cursor-pointer relative"
          >
            <IconShare stroke={2} className="hover:text-primary" />
          </CopyToClipboardButton>


          {isSelf && user.type === "BusinessOwner" && user.usersBusinesses && user.usersBusinesses.length > 0 && (
            <Button
              onClick={() => router.push(`/Business/${user.usersBusinesses[0].BusinessId}`)}
              variant="primary"
              className="ml-2 p-6"
            >
              <IconEdit stroke={2} /> View Business Profile
            </Button>
          )}
          {isSelf && (
            <Button
              variant="primary"
              className="ml-2 p-6"
              onClick={handleDelete}
            >
              <IconTrash stroke={2} /> Delete profile
            </Button>
          )}

        </div>

        {/* Bio */}
        <p className="mt-3 text-base">{user.bio}</p>
      </div>

      {/* Edit Modal */}
      {isSelf && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            await updateUser({ id: user.userId, data });
            setIsModalOpen(false);
          }}
          initialData={{
            userName: user.userName,
            bio: user.bio ?? "",
            profilePic: user.profilePic ?? "",
          }}
        />
      )}
    </div>
  );
};

export default UserProfile;
