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
import MapView from "./ui/MapView";
import ProductManager from "@/app/components/ui/ProductManager";
import HorizontalLine from "./ui/HorizontalLine";
import { getFullMediaUrl } from "./MediaUpload";

const BusinessProfile = () => {
  const params = useParams();
  const businessId = Number(params?.id);
  const router = useRouter();

  const {
    data: business,
    isLoading,
    error,
    refetch,
  } = useGetBusinessByIdQuery(businessId, {
    skip: !businessId || isNaN(businessId),
  });
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteBusiness] = useDeleteBusinessMutation();
  const { data: followers = [], refetch: refetchFollowers } =
    useGetFollowersQuery({ id: businessId, type: "Business" });
  const { data: following = [], refetch: refetchFollowings } =
    useGetFollowingQuery({ id: businessId, type: "Business" });

  const canEdit = useMemo(() => {
    return (
      currentUser?.type === "Admin" ||
      currentUser?.type === "Moderator" ||
      currentUser?.userId === business?.owner?.userId
    );
  }, [currentUser, business]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error || !business) {
    router.replace("/not-found");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background text-text">
      {/* Business Header Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Business Logo */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <img
            src={
              business.logo && business.logo.trim() !== ""
                ? getFullMediaUrl(business.logo)
                : "/default-profile.jpg"
            }
            alt={business.name}
            className="w-48 h-48  object-cover border border-gray-200 shadow-sm"
            onError={(e) => (e.currentTarget.src = "/default-profile.jpg")}
          />
        </div>

        {/* Business Details */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold font-heading">{business.name}</h1>
            <div className="flex items-center gap-2">
              {!canEdit && currentUser && (
                <FollowButton
                  followingId={businessId}
                  followingType="Business"
                  onToggle={refetchFollowers}
                />
              )}

              {canEdit && (
                <>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <IconEdit size={18} stroke={2} />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleDelete}
                  >
                    <IconTrash size={18} stroke={2} />
                    <span>Delete</span>
                  </Button>
                </>
              )}

              <CopyToClipboardButton
                copyText={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${businessId}`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IconShare size={18} stroke={2} />
              </CopyToClipboardButton>
            </div>
          </div>

          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <p>{followers?.length ?? 0} followers</p>
            <p>{following?.length ?? 0} following</p>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-base">{business.description}</p>
            <p className="text-base">
              <span className="font-medium">Category:</span> {business.category}
            </p>
          </div>
        </div>
      </div>
      <HorizontalLine className="mb-3" />

      {/* Locations Section */}
      <section className="mb-12 z-0">
        <h2 className="text-2xl font-bold font-heading mb-4">
          Business Locations
        </h2>
        <div className=" overflow-hidden  border shadow-sm">
          <MapView locations={business.businessLocations} />
        </div>
      </section>
      <HorizontalLine className="mb-3" />

      {/* Product Manager Section */}
      {canEdit && (
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Products</h2>
          <HorizontalLine className="mb-3" />
          <div className="rounded-lg shadow-sm p-4">
            <ProductManager />
          </div>
        </section>
      )}

      {/* Edit Business Modal */}
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
  );
};

export default BusinessProfile;
