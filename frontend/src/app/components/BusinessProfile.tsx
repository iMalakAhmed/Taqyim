"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  useGetBusinessByIdQuery,
  useDeleteBusinessMutation,
} from "@/app/redux/services/BusinessApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/userApi";
import EditBusinessModal from "@/app/components/ui/EditBusinessModal";
import Button from "@/app/components/ui/Button";
import CopyToClipboardButton from "@/app/components/ui/ShareButton";
import FollowButton from "@/app/components/ui/FollowButton";
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
} from "@/app/redux/services/connectionApi";
import { IconEdit, IconShare, IconTrash } from "@tabler/icons-react";
import MapView from './ui/MapView';
import ProductManager from "@/app/components/ui/ProductManager";



const BusinessProfile = () => {
  const params = useParams();
  const businessId = Number(params?.id);
  const router = useRouter();

  // 🔄 All hooks come first (no conditionals above)
  const { data: business, isLoading, error, refetch } = useGetBusinessByIdQuery(businessId, {
    skip: !businessId || isNaN(businessId),
  });
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteBusiness] = useDeleteBusinessMutation();
  const { data: followers = [], refetch: refetchFollowers } = useGetFollowersQuery({ id: businessId, type: "Business" });
  const { data: following = [], refetch: refetchFollowings } = useGetFollowingQuery({ id: businessId, type: "Business" });

  const canEdit = useMemo(() => {
    return (
      currentUser?.type === "Admin" ||
      currentUser?.type === "Moderator" ||
      currentUser?.userId === business?.owner?.userId
    );
  }, [currentUser, business]);
    

  const isFollowing = useMemo(() => {
    return followers.some(
      (f) =>
        f.userId === currentUser?.userId ||
        f.userId === (currentUser as any)?.businessId
    );
  }, [followers, currentUser]);

  // ✅ Only return after all hooks are declared
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error || !business) {
    // Redirect to a 404 page or display an error message if business not found
    router.replace('/not-found'); // Or a custom not-found page
    return null;
  }

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

          {/* ✅ Show Follow only if user is NOT the owner */}
          {!canEdit && (
            <div className="mt-4">
              <FollowButton
                followingId={businessId}
                followingType="Business"
                onToggle={() => refetchFollowers()}
              />
            </div>
          )}
        </div>

        {/* ✅ Only show Edit modal if user can edit */}
        {canEdit && (
          <EditBusinessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={() => {
              setIsModalOpen(false);
              refetch();
            }}
            initialData={business}
          />
        )}

 
      </div>


      <div className="flex flex-row items-center justify-between mt-3">
        <div className="flex flex-row">
          {/* ✅ Only show Edit/Delete if user can edit */}
          {canEdit && (
            <>
              <Button variant="primary" className="ml-2 p-6" onClick={handleDelete}>
                <IconTrash stroke={2} /> Delete Business
              </Button>
            
            <Button onClick={() => setIsModalOpen(true)} variant="primary" className="mr-3 p-6">
                <IconEdit stroke={2} /> Edit Business
              </Button>
            </>
          )}

          <CopyToClipboardButton
            copyText={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${businessId}`}
            className="ml-2 p-6"
            variant="primary"
          >
            <IconShare stroke={2} /> Share profile
          </CopyToClipboardButton>
        </div>
      </div>

      <div className="w-full max-w-5xl mt-6 mx-auto px-4 z-0">
        <h2 className="font-heading font-bold text-xl mb-2">Business Locations</h2>
        <MapView locations={business.businessLocations} />
      </div>
      {canEdit && (
        <div className="mt-6">
          <ProductManager />
        </div>
      )}
    </div>
  );
};

export default BusinessProfile;
