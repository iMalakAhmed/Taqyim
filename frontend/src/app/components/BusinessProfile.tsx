// 1. BUSINESS PROFILE COMPONENT
"use client";

import { useState } from "react";
import EditBusinessModal from "@/app/components/EditBusinessModal";
import Button from "@/app/components/ui/Button";
import { IconEdit, IconShare } from "@tabler/icons-react";
import { useGetBusinessByIdQuery } from "@/app/redux/services/BusinessApi";
import { useGetCurrentUserQuery } from "@/app/redux/services/UserApi";

const BusinessProfile = () => {
  const businessId = 1;
  const { data: business, isLoading, error, refetch } = useGetBusinessByIdQuery(businessId);
  const { data: currentUser } = useGetCurrentUserQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canEdit =
    currentUser?.type === "Admin" ||
    currentUser?.type === "Moderator" ||
    currentUser?.userId === business?.userId;

  if (isLoading) return <div>Loading...</div>;
  if (error || !business) return <div>Error loading business data.</div>;

  return (
    <div className="w-full h-full flex flex-col text-text justify-center py-10 ml-16">
      <div className="flex flex-row">
        <div className="w-1/3 p-3">
          <img
            src={business.logo ?? ""}
            alt={business.name}
            className="w-40 h-40 rounded-sm mt-4 ml-1.5"
            onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/150?img=13")}
          />
        </div>

        <div className="w-2/3 py-8 px-6 font-body">
          <h1 className="text-2xl font-heading font-bold">{business.name}</h1>
          <p className="py-3 text-xl">{business.description}</p>
          <p className="text-xl">Category: {business.category}</p>
        </div>

        {canEdit && (
          <EditBusinessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => {
              console.log("Saved:", data);
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

        {canEdit && (
          <div className="flex flex-row mt-3">
            <Button onClick={() => setIsModalOpen(true)} variant="primary" className="mr-3 p-6">
              <IconEdit stroke={2} /> Edit Business
            </Button>
            <Button variant="primary" className="ml-2 p-6">
              <IconShare stroke={2} /> Share Business
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
