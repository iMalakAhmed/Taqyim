"use client";

import { useState } from "react";
import EditProfileModal from "@/app/components/EditProfileModal";
import SideNav from "@/app/components/ui/SideNav";

const UserProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = {
    userId: 1,
    firstName: "Malak",
    lastName: "Ahmed",
    email: "malak@example.com",
    profilePic: "https://i.pravatar.cc/150?img=12",
    bio: "Full-stack developer passionate about building meaningful web applications.",
    reputationPoints: 240,
    followers: 153,
    following: 89,
    reviews: 34,
  };

  return (
    <div className="flex">
      <SideNav />

      <div className="flex-1 p-8">
        <div className="px-8 py-6 flex flex-col items-center text-center gap-4">
          <img
            src={user.profilePic}
            alt="Profile"
            className="w-32 h-32 rounded object-cover border border-gray-300"
          />

          <div>
            <h1 className="text-2xl font-bold font-heading">{user.firstName} {user.lastName}</h1>
            <div className="flex justify-center gap-6 text-sm text-gray-700 mt-2 font-body">
              <span><strong>{user.reviews}</strong> Reviews</span>
              <span><strong>{user.following}</strong> Following</span>
              <span><strong>{user.followers}</strong> Followers</span>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Share
              </button>
            </div>

            <p className="text-gray-700 text-sm mt-4 max-w-md mx-auto">
              {user.bio}
            </p>
          </div>
        </div>

        <EditProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => console.log("Saved:", data)}
          initialData={user}
        />
      </div>
    </div>
  );
};

export default UserProfile;
