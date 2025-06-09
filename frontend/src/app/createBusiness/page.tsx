"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useGetBusinessByIdQuery,
  useUpdateBusinessMutation,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from "@/app/redux/services/BusinessApi";
import { BusinessLocationUpdateType } from "@/app/redux/services/types";

export default function CreateBusinessProfilePage() {
  const router = useRouter();
  const businessId = 2; // Replace with dynamic logic as needed
  const { data: business, isLoading } = useGetBusinessByIdQuery(businessId);
  const [updateBusiness] = useUpdateBusinessMutation();
  const [addLocation] = useCreateLocationMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [locations, setLocations] = useState<BusinessLocationUpdateType[]>([]);

  useEffect(() => {
    if (business) {
      setName(business.name);
      setCategory(business.category);
      setDescription(business.description || "");
      setLogo(business.logo || "");
      setLocations(business.businessLocations || []);
    }
  }, [business]);

  const handleLocationChange = (idx: number, key: keyof BusinessLocationUpdateType, value: any) => {
    const updated = [...locations];
    updated[idx] = { ...updated[idx], [key]: value };
    setLocations(updated);
  };

  const addNewLocation = () => {
    setLocations([...locations, { label: "", address: "", latitude: null, longitude: null }]);
  };

  const removeLocation = (idx: number) => {
    setLocations(locations.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!name || locations.some(l => !l.address || !l.latitude || !l.longitude)) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (!business) {
        toast.error("Business data is missing.");
        return;
      }
      await updateBusiness({ id: business.businessId, body: { name, category, description, logo } });
      const existingIds = business.businessLocations?.map(l => l.locationId).filter(Boolean) || [];
      const updatedIds = locations.map(l => l.locationId).filter(Boolean) as number[];

      for (const id of existingIds) {
        if (!updatedIds.includes(id)) {
          await deleteLocation({ businessId: business.businessId, locationId: id });
        }
      }

      for (const loc of locations) {
        if (loc.locationId) {
          await updateLocation({
            businessId: business.businessId,
            locationId: loc.locationId,
            body: loc,
          });
        } else {
          await addLocation({
            businessId: business.businessId,
            body: loc,
          });
        }
      }

      toast.success("Business profile saved!");
      router.push(`/Business/${business.businessId}`);
      router.refresh();
    } catch (error) {
      console.error("Failed to save business:", error);
      toast.error("Update failed.");
    }
  };

  if (isLoading || !business) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Edit Business Profile</h1>

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Business Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Logo URL"
        value={logo}
        onChange={(e) => setLogo(e.target.value)}
      />

      {logo && (
        <img src={logo} alt="Preview" className="w-32 h-32 object-cover mx-auto rounded mb-4 border" />
      )}

      <h2 className="text-lg font-semibold mb-2">Locations</h2>
      {locations.map((loc, idx) => (
        <div key={loc.locationId || idx} className="bg-gray-100 p-3 mb-4 rounded">
          <input
            className="w-full p-1 mb-2 border rounded"
            placeholder="Label"
            value={loc.label ?? ""}
            onChange={(e) => handleLocationChange(idx, "label", e.target.value)}
          />
          <input
            className="w-full p-1 mb-2 border rounded"
            placeholder="Address"
            value={loc.address ?? ""}
            onChange={(e) => handleLocationChange(idx, "address", e.target.value)}
          />
          <input
            className="w-full p-1 mb-2 border rounded"
            type="number"
            placeholder="Latitude"
            value={loc.latitude ?? ""}
            onChange={(e) => handleLocationChange(idx, "latitude", parseFloat(e.target.value))}
          />
          <input
            className="w-full p-1 mb-2 border rounded"
            type="number"
            placeholder="Longitude"
            value={loc.longitude ?? ""}
            onChange={(e) => handleLocationChange(idx, "longitude", parseFloat(e.target.value))}
          />
          <button
            className="text-sm text-red-500 underline"
            onClick={() => removeLocation(idx)}
          >
            Remove Location
          </button>
        </div>
      ))}

      <button
        className="w-full bg-green-600 text-white py-2 rounded mb-4"
        onClick={addNewLocation}
      >
        + Add Location
      </button>

      <button
        className="w-full bg-blue-600 text-white py-2 rounded"
        onClick={handleSubmit}
      >
        Save Business Profile
      </button>
    </div>
  );
}
