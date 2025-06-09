"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCurrentUserQuery, useUpdateUserMutation } from "@/app/redux/services/userApi";
import toast from "react-hot-toast";
import { authApi } from "@/app/redux/services/authApi";
import { useDispatch } from "react-redux";

export default function CreateProfilePage() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [updateUser] = useUpdateUserMutation();
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const dispatch = useDispatch();


  const handleSubmit = async () => {
    if (!user) return;

    try {
      await updateUser({
        id: user.userId,
        data: { userName, bio, profilePic },
      }).unwrap();
      dispatch(authApi.util.invalidateTags(["Auth"]));

      toast.success("Profile created!");
      router.push(`/profile/${user.userId}?refresh=${Date.now()}`); // Force refetch
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to create profile.");
    }
  };

  if (isLoading || !user) return <div>Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Your Profile</h1>

      <label className="block mb-2 font-medium">Username</label>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Bio</label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        rows={4}
      />

      <label className="block mb-2 font-medium">Profile Picture URL</label>
      <input
        type="text"
        value={profilePic}
        onChange={(e) => setProfilePic(e.target.value)}
        className="w-full p-2 border rounded mb-6"
      />

      {profilePic && (
        <img
          src={profilePic}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-full mx-auto mb-4 border"
        />
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Profile
      </button>
    </div>
  );
}
