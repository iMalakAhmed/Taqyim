"use client";

import { useState ,useEffect } from "react";
import EditProfileModal from "@/app/components/EditProfileModal";
import Button from "@/app/components/ui/Button";
import { useGetUserByIdQuery , useUpdateUserMutation } from "@/app/redux/services/UserApi";
import { IconEdit } from '@tabler/icons-react';
import { IconShare } from '@tabler/icons-react';



const UserProfile = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const query = useGetUserByIdQuery(userId!, { skip: !userId });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateUser] = useUpdateUserMutation();
  const { data: userData, isLoading, error } = query;

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(parseInt(id));
  }, []);

  const user = {
    userId: 1,
    firstName: "Malak",
    lastName: "Ahmed",
    profilePic: "https://i.pravatar.cc/150?img=12",
    bio: "Full-stack developer passionate about building meaningful web applications.",
    followers: 153,
    following: 89,
    reviews: 34,
  };

  return (
    <div className="W-full h-full flex flex-row text-text justify-center py-10 ml-16">
      <div className="w-1/3 p-3 ">
          <img
            src={user.profilePic}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-64 h-60 rounded-sm mb-4"
          />
      </div>


      <div className="w-2/3 py-8 px-6 font-body">
          <h2 className="text-xl font-heading font-bold">{`${user.firstName} ${user.lastName}`}</h2>
          <p className="mb-4 py-3">{user.bio}</p>
          <div className="flex flex-row justify-between mb-4 pb-2">
            <p className="text-sm"> {user.followers} Followers</p>
            <p className="text-sm"> {user.following} Following</p>
            <p className="text-sm"> {user.reviews} Reviews</p>
          </div>
          <div className="flex flex-row mb-4 " > 
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm" className="mr-2">
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
            await updateUser({ id: user.userId, body: data });
            setIsModalOpen(false);
          }}
          
          initialData={user}
        />
    </div>
  );
};

export default UserProfile;
