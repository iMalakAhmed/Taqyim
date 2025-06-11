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
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const categoryOptions = [
  "Food & Dining",
  "Retail & Shopping",
  "Health & Wellness",
  "Services & Professional",
  "Entertainment & Lifestyle",
  "Education & Technology",
  "Other",
];
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

function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [disableClick, setDisableClick] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDisableClick(false), 1000);
    return () => clearTimeout(timeout);
  }, [disableClick]);

  useMapEvents({
    click(e) {
      if (!disableClick) onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function FitBounds({ locations }: { locations: BusinessLocationUpdateType[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([30.0444, 31.2357], 13);
    }
  }, [locations, map]);

  return null;
}

const EditBusinessModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData.name || "");
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Array.isArray(initialData.category)
      ? initialData.category.filter((c): c is string => typeof c === "string")
      : typeof initialData.category === "string"
        ? [initialData.category]
        : []
  );
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState(initialData.description || "");
  const [logo, setLogo] = useState(initialData.logo || "");
  const [address, setAddress] = useState("");
  const [locations, setLocations] = useState<BusinessLocationUpdateType[]>([]);

  const [updateBusiness] = useUpdateBusinessMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [addLocation] = useCreateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  useEffect(() => {
    setLocations(initialData.businessLocations || []);
  }, [initialData.businessLocations]);

  const geocodeAddress = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          address
        )}&format=json`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const newLocation: BusinessLocationUpdateType = {
          label: data[0].display_name?.split(",")[0] || "Selected on map",
          address: data[0].display_name || "Selected on map",
          latitude: lat,
          longitude: lng,
        };
        setLocations((prev) => [...prev, newLocation]);
        toast.success("Location added");
      } else {
        toast.error("Location not found");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      toast.error("Geocoding failed");
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Please enter a business name.");
      return;
    }

    try {
      const result: any = await updateBusiness({
      id: initialData.businessId,
      body: {
        name,
        category: [
          ...selectedCategories.filter((c) => c !== "Other"),
          ...(selectedCategories.includes("Other") && customCategory ? [customCategory] : []),
        ],
        description,
        logo,
      },
    });

      if (!result || 'error' in result || !result.data) {
        throw new Error("Business update failed");
      }

      for (const loc of locations) {
        if (loc.locationId) {
          await updateLocation({
            businessId: initialData.businessId,
            locationId: loc.locationId,
            body: loc,
          });
        } else {
          await addLocation({
            businessId: initialData.businessId,
            body: loc,
          });
        }
      }

      toast.success("Business and locations updated.");
      onSave({
        ...(result.data || {}),
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
    <div className="fixed inset-0 flex justify-center items-start z-50 overflow-y-auto">
      <div className="bg-gray-300 p-6 rounded-lg w-full max-w-md shadow-lg overflow-y-auto max-h-[90vh] mt-24">
        <h2 className="text-xl font-semibold mb-4">Edit Business</h2>

        <input
          type="text"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        <div className="mb-4">
        <label className="block font-semibold mb-2">Select Categories</label>
        <div className="grid grid-cols-2 gap-2">
          {categoryOptions.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={cat}
                checked={selectedCategories.includes(cat)}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategories((prev) =>
                    prev.includes(value)
                      ? prev.filter((c) => c !== value)
                      : [...prev, value]
                  );
                }}
              />
              {cat}
            </label>
          ))}
        </div>
        {selectedCategories.includes("Other") && (
          <input
            className="mt-2 p-2 border rounded w-full"
            placeholder="Enter custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />
        )}
      </div>


        <h3 className="text-lg font-semibold mb-2">Business Locations</h3>
        <input
          type="text"
          placeholder="Search address by name"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          onClick={geocodeAddress}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search & Add Location
        </button>

        <div className="w-full h-64 mb-4">
          <MapContainer
            center={[30.0444, 31.2357]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <LocationPicker
              onSelect={async (lat, lng) => {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                );
                const data = await res.json();
                const newLocation: BusinessLocationUpdateType = {
                  label: data?.display_name?.split(",")[0] || "Selected on map",
                  address: data?.display_name || "Selected on map",
                  latitude: lat,
                  longitude: lng,
                };
                setLocations((prev) => [...prev, newLocation]);
              }}
            />

            <FitBounds locations={locations} />

            {locations.map((loc, index) => (
              <Marker
                key={index}
                position={[
                  loc.latitude ?? 0,
                  loc.longitude ?? 0
                ]}
                draggable={true}
                eventHandlers={{
                  dragend: async (e) => {
                    const newLat = e.target.getLatLng().lat;
                    const newLng = e.target.getLatLng().lng;
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`
                      );
                      const data = await res.json();
                      const newLabel = data?.display_name?.split(",")[0] || "Moved on map";
                      const newAddress = data?.display_name || "Moved on map";
                      setLocations((prev) =>
                        prev.map((l, i) =>
                          i === index
                            ? {
                                ...l,
                                latitude: newLat,
                                longitude: newLng,
                                label: newLabel,
                                address: newAddress,
                              }
                            : l
                        )
                      );
                    } catch (error) {
                      console.error("Reverse geocoding failed", error);
                      setLocations((prev) =>
                        prev.map((l, i) =>
                          i === index
                            ? {
                                ...l,
                                latitude: newLat,
                                longitude: newLng,
                                label: "Moved on map",
                                address: "Moved on map",
                              }
                            : l
                        )
                      );
                    }
                  },
                  click: () => {
                    if (confirm(`Delete location "${loc.label}"?`)) {
                      const toDelete = locations[index];
                      if (toDelete.locationId) {
                        deleteLocation({
                          businessId: initialData.businessId,
                          locationId: toDelete.locationId,
                        });
                      }
                      setLocations((prev) => prev.filter((_, i) => i !== index));
                    }
                  },
                }}
                icon={L.icon({
                  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>
                  <input
                    type="text"
                    className="p-1 border rounded text-sm"
                    value={loc.label ?? ""}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      setLocations((prev) =>
                        prev.map((l, i) => (i === index ? { ...l, label: newLabel } : l))
                      );
                    }}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded"
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
