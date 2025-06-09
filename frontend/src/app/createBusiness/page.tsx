"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  useUpdateBusinessMutation,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useCreateBusinessMutation,
  useGetBusinessByIdQuery,
} from "@/app/redux/services/BusinessApi";
import { BusinessLocationUpdateType } from "@/app/redux/services/types";
import { useDispatch } from "react-redux";
import { authApi } from "@/app/redux/services/authApi";
import { skipToken } from "@reduxjs/toolkit/query";

export default function CreateBusinessProfilePage() {
  const router = useRouter();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [addLocation] = useCreateLocationMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();
  const [createBusiness] = useCreateBusinessMutation();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [locations, setLocations] = useState<BusinessLocationUpdateType[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<number | null>(null);
  const [location, setLocation] = useState("");

  const searchParams = useSearchParams();
  const editBusinessId = searchParams.get('businessId');

  const { data: business, isLoading: isBusinessLoading } = useGetBusinessByIdQuery(
    editBusinessId ? Number(editBusinessId) : skipToken
  );

  useEffect(() => {
    if (business) {
      setName(business.name);
      setCategory(business.category?.[0] || ""); // Assuming single category for now
      setDescription(business.description || "");
      setLogo(business.logo || "");
      setLocation(business.location || "");
      setLocations(business.businessLocations || []);
      setCurrentBusinessId(business.businessId);
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
    console.log("handleSubmit called");
    if (!name || locations.some(l => !l.address || !l.latitude || !l.longitude)) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      let newBusinessId = currentBusinessId;

      if (!newBusinessId) {
        console.log("Attempting to create business with:", {
          name,
          category: category ? [category] : undefined,
          description,
          logo: logo || undefined,
          location: location || undefined,
        });
        const res = await createBusiness({
          name,
          category: category ? [category] : undefined,
          description,
          logo: logo || undefined,
          location: location || undefined,
        }).unwrap();
        newBusinessId = res.businessId;
        setCurrentBusinessId(newBusinessId);
      }

      const existingIds = business?.businessLocations?.map(l => l.locationId).filter(Boolean) || [];
      const updatedIds = locations.map(l => l.locationId).filter(Boolean) as number[];

      for (const id of existingIds) {
        if (!updatedIds.includes(id)) {
          if (newBusinessId) {
            await deleteLocation({ businessId: newBusinessId, locationId: id });
          }
        }
      }

      for (const loc of locations) {
        if (loc.locationId) {
          if (newBusinessId) {
            await updateLocation({
              businessId: newBusinessId,
              locationId: loc.locationId,
              body: loc,
            });
          }
        } else {
          if (newBusinessId) {
            await addLocation({
              businessId: newBusinessId,
              body: loc,
            });
          }
        }
      }

      toast.success("Business profile saved!");
      
      dispatch(authApi.util.invalidateTags(['Auth']));

      if (newBusinessId) {
        router.push(`/Business/${newBusinessId}`);
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Failed to save business:", error);
      toast.error("Error creating/saving business.");
    }
  };

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

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Business Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
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
