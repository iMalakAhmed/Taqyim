"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useUpdateBusinessMutation,
  useCreateLocationMutation,
  useGetMyBusinessQuery,
  useCreateProductMutation,
} from "@/app/redux/services/BusinessApi";
import { BusinessLocationUpdateType } from "@/app/redux/services/types";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useMap } from "react-leaflet";

export default function CreateBusinessProfilePage() {
  const router = useRouter();
  const [updateBusiness] = useUpdateBusinessMutation();
  const [addLocation] = useCreateLocationMutation();
  const [createProduct] = useCreateProductMutation();

  const [name, setName] = useState("");
  const categoryOptions = [
    "Food-Dining",
    "Retail-Shopping",
    "Health-Wellness",
    "Services-Professional",
    "Entertainment-Lifestyle",
    "Education-Technology",
    "Other",
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [locations, setLocations] = useState<BusinessLocationUpdateType[]>([]);
  const [currentBusinessId, setCurrentBusinessId] = useState<number | null>(null);

  const [products, setProducts] = useState([{ name: "", description: "" }]);
  const [showProducts, setShowProducts] = useState(false);

  const { data: business } = useGetMyBusinessQuery();

  useEffect(() => {
    if (business) {
      setCurrentBusinessId(business.businessId ?? null);
      setName(business.name ?? "");
      setSelectedCategories(business.category ?? []);
      setDescription(business.description ?? "");
      setLogo(business.logo ?? "");
      setLocations(business.businessLocations ?? []);
    }
  }, [business]);

  const handleLocationUpdate = (index: number, newLoc: BusinessLocationUpdateType) => {
    setLocations((prev) =>
      prev.map((loc, i) => (i === index ? { ...loc, ...newLoc } : loc))
    );
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const label = data?.display_name?.split(",")[0] || "Selected";
      const address = data?.display_name || "Unknown";
      setLocations((prev) => [...prev, { label, address, latitude: lat, longitude: lng }]);
    } catch {
      toast.error("Reverse geocoding failed");
    }
  };

  const handleAddressSearch = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          addressSearch
        )}&format=json`
      );
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handleMapClick(lat, lng);
        toast.success("Location added");
      } else toast.error("Location not found");
    } catch {
      toast.error("Search failed");
    }
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: "", description: "" }]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleSubmit = async () => {
    if (!name || locations.some((l) => !l.address || !l.latitude || !l.longitude)) {
      toast.error("Fill in all required fields");
      return;
    }
    if (!currentBusinessId) {
      toast.error("Business ID missing");
      return;
    }

    try {
      await updateBusiness({
        id: currentBusinessId,
        body: {
          name,
          category: [
            ...selectedCategories.filter((c) => c !== "Other"),
            ...(selectedCategories.includes("Other") && customCategory ? [customCategory] : []),
          ],
          description: description || null,
          logo: logo || null,
        },
      });

      for (const loc of locations) {
        if (loc.locationId) {
          await addLocation({ businessId: currentBusinessId, body: loc });
        }
      }

      if (showProducts) {
        for (const product of products) {
          if (product.name.trim()) {
            await createProduct({
              businessId: currentBusinessId,
              body: product,
            }).unwrap();
          }
        }
      }

      toast.success("Business profile updated");
      router.push(`/Business/${currentBusinessId}`);
    } catch (error) {
      toast.error("Failed to update business profile");
      console.error(error);
    }
  };

  function LocationPicker() {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng.lat, e.latlng.lng);
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
      }
    }, [locations, map]);
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4 text-center">Create Business Profile</h1>

      <input className="w-full p-2 border rounded mb-4" placeholder="Business Name" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea className="w-full p-2 border rounded mb-4" rows={4} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full p-2 border rounded mb-4" placeholder="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} />

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
                    prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
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

      {logo && <img src={logo} alt="Preview" className="w-32 h-32 object-cover mb-4 mx-auto" />}

      <h2 className="text-lg font-semibold mb-2">Business Locations</h2>
      <div className="flex mb-4 gap-2">
        <input className="flex-1 p-2 border rounded" placeholder="Search address" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} />
        <button onClick={handleAddressSearch} className="bg-blue-600 text-white px-4 rounded">Search</button>
      </div>

      <div className="h-64 w-full mb-4 relative z-0 overflow-hidden">
        <MapContainer center={[30.0444, 31.2357]} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker />
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
                  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json`);
                  const data = await res.json();
                  handleLocationUpdate(index, {
                    latitude: newLat,
                    longitude: newLng,
                    label: data?.display_name?.split(",")[0] || "Updated",
                    address: data?.display_name || "Updated",
                  });
                },
                click: () => {
                  if (confirm(`Delete location "${loc.label}"?`)) {
                    setLocations((prev) => prev.filter((_, i) => i !== index));
                  }
                },
              }}
              icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })}
            >
              <Popup>
                <input
                  className="p-1 border rounded text-sm"
                  value={loc.label ?? ""}
                  onChange={(e) => handleLocationUpdate(index, { label: e.target.value })}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Toggleable Products Section */}
      <div className="mb-6">
        {!showProducts ? (
          <button
            onClick={() => setShowProducts(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Products
          </button>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2">Products</h2>
            {products.map((product, index) => (
              <div key={index} className="mb-4 border p-3 rounded bg-gray-50">
                <input
                  className="w-full p-2 mb-2 border rounded"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, "name", e.target.value)}
                />
                <textarea
                  className="w-full p-2 mb-2 border rounded"
                  placeholder="Product Description"
                  value={product.description}
                  onChange={(e) => handleProductChange(index, "description", e.target.value)}
                />
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove Product
                </button>
              </div>
            ))}
            <button
              onClick={handleAddProduct}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Another Product
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-2 rounded z-10 relative hover:bg-accent"
      >
        Save Business Profile
      </button>
    </div>
  );
}
