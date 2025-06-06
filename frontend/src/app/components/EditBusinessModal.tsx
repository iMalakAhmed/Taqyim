"use client";

import React, { useState, useEffect } from "react";
import {
  BusinessLocationUpdateType,
  BusinessUpdateType,
} from "@/app/redux/services/types";
import {
  useUpdateBusinessMutation,
  useUpdateLocationMutation,
  useCreateLocationMutation,
  useDeleteLocationMutation,
} from "@/app/redux/services/BusinessApi";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: BusinessUpdateType & {
      businessLocations: BusinessLocationUpdateType[];
    }
  ) => void;
  initialData: BusinessUpdateType & {
    businessId: number;
    businessLocations?: BusinessLocationUpdateType[];
  };
}

const EditBusinessModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData.name || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [logo, setLogo] = useState(initialData.logo || "");
  const [locations, setLocations] = useState<BusinessLocationUpdateType[]>([]);

  const [updateBusiness] = useUpdateBusinessMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [addLocation] = useCreateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  useEffect(() => {
    setLocations(initialData.businessLocations || []);
  }, [initialData.businessLocations]);

  const handleLocationChange = (
    index: number,
    key: keyof BusinessLocationUpdateType,
    value: any
  ) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [key]: value };
    setLocations(updated);
  };

  const addNewLocation = () => {
    setLocations([
      ...locations,
      {
        label: "",
        address: "",
        latitude: null,
        longitude: null,
      },
    ]);
  };

  const removeLocation = (index: number) => {
    const updated = [...locations];
    updated.splice(index, 1);
    setLocations(updated);
  };

  const handleSubmit = async () => {
    const hasInvalidLocation = locations.some(
      (loc) =>
        !loc.address ||
        typeof loc.latitude !== "number" ||
        typeof loc.longitude !== "number"
    );

    if (!name || hasInvalidLocation) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      await updateBusiness({
        id: initialData.businessId,
        body: { name, category, description, logo },
      });

      const existingIds = (initialData.businessLocations?.map((l) => l.locationId).filter((id): id is number => typeof id === "number") ?? []);
      const updatedIds = locations.map((l) => l.locationId).filter((id): id is number => typeof id === "number");

      for (const existingId of existingIds) {
        if (!updatedIds.includes(existingId)) {
          await deleteLocation({
            businessId: initialData.businessId,
            locationId: existingId,
          });
        }
      }

      for (const loc of locations) {
        if (loc.locationId && loc.locationId > 0) {
          await updateLocation({
            businessId: initialData.businessId,
            locationId: loc.locationId,
            body: loc,
          });
        } else {
          const result = await addLocation({
            businessId: initialData.businessId,
            body: loc,
          }) as { data?: { locationId?: number } };

          if ("data" in result && result.data?.locationId) {
            loc.locationId = result.data.locationId;
          }
        }
      }

      toast.success("Business updated successfully.");

      onSave({
        name,
        category,
        description,
        logo,
        businessLocations: locations,
      });

      onClose();
    } catch (error) {
      console.error("Error updating business or locations:", error);
      toast.error("Update failed. Try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-gray-300 opacity-80 p-6 rounded-lg w-full max-w-md shadow-lg overflow-y-auto max-h-[90vh] mt-24">
        <h2 className="text-xl font-semibold mb-4">Edit Business</h2>

        <input
          type="text"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Logo URL"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <h3 className="text-lg font-semibold mb-2">Business Locations</h3>
        {locations.map((loc, idx) => (
          <div key={loc.locationId || idx} className="mb-4 border p-2 rounded bg-white">
            <input
              type="text"
              placeholder="Label"
              value={loc.label || ""}
              onChange={(e) => handleLocationChange(idx, "label", e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Address"
              value={loc.address || ""}
              onChange={(e) => handleLocationChange(idx, "address", e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Latitude"
              value={loc.latitude ?? ""}
              onChange={(e) => handleLocationChange(idx, "latitude", parseFloat(e.target.value))}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={loc.longitude ?? ""}
              onChange={(e) => handleLocationChange(idx, "longitude", parseFloat(e.target.value))}
              className="w-full mb-2 p-2 border rounded"
            />
            <button
              className="text-sm text-red-600 underline"
              onClick={() => removeLocation(idx)}
            >
              Remove Location
            </button>
          </div>
        ))}

        <button
          className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={addNewLocation}
        >
          + Add New Location
        </button>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBusinessModal;
