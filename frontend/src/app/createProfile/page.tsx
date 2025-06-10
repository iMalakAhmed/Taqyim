"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUpdateUserMutation } from "@/app/redux/services/userApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/authApi";
import { useDeleteMediaMutation } from "@/app/redux/services/mediaApi";
import { useDispatch } from "react-redux";
import { authApi } from "@/app/redux/services/authApi";
import MediaUpload, { getFullMediaUrl } from "@/app/components/MediaUpload";

export default function CreateProfilePage() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [profilePicId, setProfilePicId] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await updateUser({
        id: user.userId,
        data: {
          userName: user.userName,
          bio,
          profilePic,
        },
      }).unwrap();
      dispatch(authApi.util.invalidateTags(["Auth"]));

      toast.success("Profile updated!");
      router.push(`/profile/${user.userId}?refresh=${Date.now()}`);
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleDeleteProfilePic = async () => {
    if (!profilePicId) {
      setProfilePic("");
      return;
    }

    try {
      await deleteMedia(profilePicId).unwrap();
      setProfilePic("");
      setProfilePicId(null);
      toast.success("Profile picture deleted.");
    } catch {
      toast.error("Failed to delete image.");
    }
  };

  if (isLoading || !user) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Create Your Profile
      </h1>

      <label className="block mb-2 font-medium">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        rows={4}
      />

      <label className="block mb-2 font-medium">Upload Profile Picture</label>
      <MediaUpload
        onUploadSuccess={(mediaId) => {
          fetch(`/api/media/${mediaId}`)
            .then((res) => res.json())
            .then((media) => {
              setProfilePic(media.filePath);
              setProfilePicId(media.mediaId);
            })
            .catch(() => toast.error("Failed to fetch uploaded image"));
        }}
        onDeleteSuccess={() => {
          setProfilePic("");
          setProfilePicId(null);
        }}
      />

      {profilePic && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <img
            src={getFullMediaUrl(profilePic)}
            alt="Preview"
            className="w-24 h-24 object-cover border"
          />
          <button
            onClick={handleDeleteProfilePic}
            className="text-sm text-red-600 hover:underline"
          >
            Delete Image
          </button>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </div>
  );
}
