"use client";

import { useState } from "react";
import EditProfileModal from "@/app/components/EditProfileModal";
import Button from "@/app/components/ui/Button";
import {
  useGetCurrentUserQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/app/redux/services/userApi";
import { IconEdit, IconShare, IconTrash } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { authApi } from "@/app/redux/services/authApi";
import { removeAuthCookie } from "@/app/actions/auth";

const UserProfile = () => {
  const searchParams = useSearchParams();
  const viewedId = searchParams.get("id");

  const {
    data: currentUser,
    isLoading: isCurrentLoading,
    error: currentError,
  } = useGetCurrentUserQuery();

  const {
    data: viewedUser,
    isLoading: isUserLoading,
    error: userError,
    refetch,
  } = useGetUserQuery(Number(viewedId), {
    skip: !viewedId,
  });

  const user = viewedUser ?? currentUser;
  const isLoading = viewedId ? isUserLoading : isCurrentLoading;
  const error = viewedId ? userError : currentError;
  const isSelf = !viewedId || (currentUser && Number(viewedId) === currentUser.userId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  if (isLoading || (viewedId && !currentUser)) return <div>Loading...</div>;
  if (error || !user) return <div>Error loading profile</div>;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this user?")) {
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

  return (
    <div className="W-full h-full flex flex-row text-text justify-center py-10 ml-16">
      <div className="w-1/3 p-3">
        <img
          src={
            user.profilePic && user.profilePic.trim() !== ""
              ? user.profilePic
              : "\\default-profile.jpg"
          }
          alt={
            user.userName
          }
          className="w-60 h-40 rounded-sm mb-4 object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "default-profile.jpg";
          }}
        />
      </div>

      <div className="w-2/3 py-8 px-6 font-body">
        <h2 className="text-xl font-heading font-bold">{user.userName}</h2>
        <p className="mb-4 py-3">{user.bio}</p>

        <div className="flex flex-row mt-3">
          {isSelf && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              className="ml-2 p-6"
            >
              <IconEdit stroke={2} /> Edit profile
            </Button>
          )}
          <Button variant="primary" className="ml-2 p-6">
            <IconShare stroke={2} /> Share profile
          </Button>
          <Button
            onClick={() => router.push("/home")}
            variant="primary"
            className="ml-2 p-6"
          >
            <IconShare stroke={2} /> Go to Home
          </Button>
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
      </div>

      {isSelf && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            await updateUser({ id: user.userId, data });
            refetch();
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
