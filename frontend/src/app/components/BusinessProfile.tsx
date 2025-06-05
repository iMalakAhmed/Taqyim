"use client";

import Button from "@/app/components/ui/Button";
import { IconEdit, IconShare } from "@tabler/icons-react";
import { useState } from "react";
import EditBusinessModal from "@/app/components/EditBusinessModal";

const BusinessProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const business = {
    businessId: 1,
    name: "Café El Gusto",
    category: "Cafe",
    description: "A cozy spot for coffee lovers in the heart of Cairo.",
    location: "Downtown, Cairo",
    logo: "https://i.pravatar.cc/150?img=13",
    businessLocations: [
      {
        locationId: 1,
        address: "123 Tahrir St",
        latitude: 30.0444,
        longitude: 31.2357,
        label: "Main Branch",
      },

     {
        locationId: 2,
        address: "123 Tahrir St",
        latitude: 30.0444,
        longitude: 31.2357,
        label: "Main Branch",
     },


    ],
  };

  return (
    <div className="w-full h-full flex flex-col text-text justify-center py-10 ml-16">
    <div className="flex flex-row">
          <div className="w-1/3 p-3 ">
              <img
                src={business.logo}
                alt={`${business.name} `}
                className="w-40 h-40 rounded-sm mt-4 ml-1.5"
              />
          </div>
    
    
          <div className="w-2/3 py-8 px-6 font-body">
              <h1 className="text-2xl font-heading font-bold">{`${business.name}`}</h1>
              <p className="py-3 text-xl">{business.description}</p>
              <div className="flex flex-col justify-between mb-4">
                <p className="text-xl">Category: {business.category}</p>
              </div>
              
          </div>

          <EditBusinessModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => console.log("Saved:", data)}
            initialData={business}
          />
    </div>
    <div className="flex flex-row items-center justify-between">
        <div className="text-left w-full ml-2">
                <h1 className="mb-3 font-heading font-bold text-xl">Locations:</h1>
                {business.businessLocations.map((loc) => (
                <p key={loc.locationId} className="">
                    📍 {loc.label}: {loc.address}
                </p>
                ))}
        </div>
        <div className="flex flex-row mt-3" > 
                <Button onClick={() => setIsModalOpen(true)} variant="primary" className="mr-3 p-6">
                  <IconEdit stroke={2} /> Edit Business
                </Button>
                <Button variant="primary"  className="ml-2 p-6">
                  <IconShare stroke={2} /> Share Business
                </Button>
        </div>
    </div>
    </div>
  );
};

export default BusinessProfile;
