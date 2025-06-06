"use client";

import { useState } from "react";
import EditProfileModal from "@/app/components/EditProfileModal";
import Button from "@/app/components/ui/Button";
import {
  useGetCurrentUserQuery,
  useUpdateUserMutation,
} from "@/app/redux/services/userApi";
import { IconEdit } from "@tabler/icons-react";
import { IconShare } from "@tabler/icons-react";

const UserProfile = () => {
  const { data: user, isLoading, error, refetch } = useGetCurrentUserQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateUser] = useUpdateUserMutation();

  if (isLoading) return <div>Loading...</div>;
  if (error || !user) return <div>Error loading profile</div>;



  return (
    <div className="W-full h-full flex flex-row text-text justify-center py-10 ml-16">
      <div className="w-1/3 p-3">
        <img
          src={user.profilePic && user.profilePic.trim() !== "" ? user.profilePic : "\default-profile.jpg"}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-60 h-40 rounded-sm mb-4 object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "default-profile.jpg"; // Fallback image
          }}
        />
      </div>

      <div className="w-2/3 py-8 px-6 font-body">
        <h2 className="text-xl font-heading font-bold">{`${user.firstName} ${user.lastName}`}</h2>
        <p className="mb-4 py-3">{user.bio}</p>

        <div className="flex flex-row mb-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="sm"
            className="mr-2"
          >
            <IconEdit stroke={2} /> Edit Profile
          </Button>
          <Button variant="primary" size="sm" className="ml-2">
            <IconShare stroke={2} /> Share Profile
          </Button>
        </div>
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (data) => {
          await updateUser({ id: user.userId, data });
          refetch();
          setIsModalOpen(false);
        }}
        initialData={{
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio ?? "",
          profilePic: user.profilePic ?? "",
        }}
      />
    </div>
  );
};

export default UserProfile;
