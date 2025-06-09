"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  useGetBusinessByIdQuery,
  useDeleteBusinessMutation,
} from "@/app/redux/services/BusinessApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/userApi";
import EditBusinessModal from "@/app/components/EditBusinessModal";
import Button from "@/app/components/ui/Button";
import CopyToClipboardButton from "@/app/components/ui/ShareButton";
import FollowButton from "@/app/components/ui/FollowButton";
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
} from "@/app/redux/services/connectionApi";
import { IconEdit, IconShare, IconTrash } from "@tabler/icons-react";

const BusinessProfile = () => {
  const params = useParams();
  const businessId = Number(params.id);
  const router = useRouter();

  const { data: business, isLoading, error, refetch } = useGetBusinessByIdQuery(businessId);
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteBusiness] = useDeleteBusinessMutation();

  const { data: followers = [] , refetch: refetchFollowers} = useGetFollowersQuery({ id: businessId, type: "Business" });
  const { data: following = [] ,refetch:refetchFollowings} = useGetFollowingQuery({ id: businessId, type: "Business"});

  const isFollowing = followers.some(f =>
  f.userId === currentUser?.userId || f.userId === (currentUser as any)?.businessId
);

  const canEdit =
    currentUser?.type === "Admin" ||
    currentUser?.type === "Moderator" ||
    currentUser?.userId === business?.userId;

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this business?")) {
      try {
        await deleteBusiness(businessId);
        toast.success("Business deleted successfully");
        router.push("/home");
      } catch (err) {
        console.error("Delete failed", err);
        toast.error("Failed to delete business");
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !business) return <div>Error loading business data.</div>;

  return (
    <div className="w-full h-full flex flex-col text-text justify-center py-10 ml-16">
      <div className="flex flex-row">
        <div className="w-1/3 p-3">
          <img
            src={business.logo && business.logo.trim() !== "" ? business.logo : "default-profile.jpg"}
            alt={business.name}
            className="w-40 h-40 rounded-sm mt-4 ml-1.5"
            onError={(e) => (e.currentTarget.src = "default-profile.jpg")}
          />
        </div>

        <div className="w-2/3 py-8 px-6 font-body">
          <h1 className="text-2xl font-heading font-bold">{business.name}</h1>
          <p className="py-3 text-xl">{business.description}</p>
          <p className="text-xl">Category: {business.category}</p>

          <div className="mt-4 space-y-1">
            <p><strong>Followers:</strong> {followers.length}</p>
            <p><strong>Following:</strong> {following.length}</p>
          </div>

          {currentUser?.userId !== business?.userId && (
            <div className="mt-4">
              <FollowButton
                followingId={businessId}
                followingType="Business"
                isInitiallyFollowing={isFollowing}
                onToggle={(newState) => {
                refetchFollowers();
              }}
              />
            </div>
          )}
        </div>

        {canEdit && (
          <EditBusinessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => {
              setIsModalOpen(false);
              refetch();
            }}
            initialData={business}
          />
        )}
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="text-left w-full ml-2">
          <h1 className="mb-3 font-heading font-bold text-xl">Locations:</h1>
          {business.businessLocations?.map((loc) => (
            <p key={loc.locationId}>
              📍 {loc.label}: {loc.address} ({loc.latitude}, {loc.longitude})
            </p>
          ))}
        </div>

        <div className="flex flex-row mt-3">
          {canEdit && (
            <Button onClick={() => setIsModalOpen(true)} variant="primary" className="mr-3 p-6">
              <IconEdit stroke={2} /> Edit Business
            </Button>
          )}

          <CopyToClipboardButton
            copyText={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${businessId}`}
            className="ml-2 p-6"
            variant="primary"
          >
            <IconShare stroke={2} /> Share profile
          </CopyToClipboardButton>

          {canEdit && (
            <Button variant="primary" className="ml-2 p-6" onClick={handleDelete}>
              <IconTrash stroke={2} /> Delete Business
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;
