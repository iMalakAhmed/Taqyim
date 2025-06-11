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
import HorizontalLine from "./HorizontalLine";
import Button from "./Button";
import { IconSearch, IconX } from "@tabler/icons-react";

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

function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
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
        locations.map(
          (loc) => [loc.latitude, loc.longitude] as [number, number]
        )
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
  const [category, setCategory] = useState(initialData.category || "");
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
          category:
            typeof category === "string"
              ? category
                ? [category]
                : []
              : category,
          description,
          logo,
        },
      });

      if (!result || "error" in result || !result.data) {
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
    <div
      className="fixed inset-0 flex justify-center items-center z-[999] bg-black/30 backdrop-invert-25"
      onClick={onClose}
    >
      <div
        className="bg-background shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          aria-label="Close modal"
          variant="none"
          size="sm"
          className="absolute top-2 right-2 hover:text-accent"
        >
          <IconX />
        </Button>

        <h2 className="text-xl font-semibold mb-2">Edit Business</h2>
        <HorizontalLine />

        <form className="space-y-4 mt-4">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block font-medium mb-1">
              Business Name <span className="text-accent">*</span>
            </label>
            <input
              id="businessName"
              type="text"
              placeholder="Business Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block font-medium mb-1">
              Category <span className="text-accent">*</span>
            </label>
            <input
              id="category"
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Logo URL */}
          <div>
            <label htmlFor="logo" className="block font-medium mb-1">
              Logo URL
            </label>
            <input
              id="logo"
              type="text"
              placeholder="Logo URL"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none"
            />
            {logo && (
              <div className="mt-3 flex flex-col items-start gap-2">
                <img
                  src={logo}
                  alt="Logo Preview"
                  className="w-20 h-20 object-cover border"
                  onError={(e) =>
                    (e.currentTarget.src = "/default-profile.jpg")
                  }
                />
              </div>
            )}
          </div>

          <HorizontalLine />

          {/* Business Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Business Locations</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Search address by name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 px-3 py-2 border rounded focus:outline-none"
              />
              <Button
                onClick={geocodeAddress}
                variant="primary"
                size="sm"
                className="flex items-center gap-1"
              >
                <IconSearch size={16} />
                <span>Search & Add</span>
              </Button>
            </div>

            <div className="w-full h-64 mb-4 rounded-lg overflow-hidden border">
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
                      label:
                        data?.display_name?.split(",")[0] || "Selected on map",
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
                    position={[loc.latitude ?? 0, loc.longitude ?? 0]}
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
                          const newLabel =
                            data?.display_name?.split(",")[0] || "Moved on map";
                          const newAddress =
                            data?.display_name || "Moved on map";
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
                          setLocations((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }
                      },
                    }}
                    icon={L.icon({
                      iconUrl:
                        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                    })}
                  >
                    <Popup className="custom-popup">
                      <input
                        type="text"
                        className="p-1 border rounded text-sm w-full"
                        value={loc.label ?? ""}
                        onChange={(e) => {
                          const newLabel = e.target.value;
                          setLocations((prev) =>
                            prev.map((l, i) =>
                              i === index ? { ...l, label: newLabel } : l
                            )
                          );
                        }}
                      />
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <HorizontalLine />

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="button" onClick={handleSubmit}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBusinessModal;
