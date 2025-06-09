'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap,Tooltip } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { BusinessLocationType } from '@/app/redux/services/types';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix missing marker icon
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src ?? markerIcon,
  shadowUrl: markerShadow.src ?? markerShadow,
});

type Props = {
  locations: BusinessLocationType[];
};

function AutoCenter({ locations }: { locations: BusinessLocationType[] }) {
  const map = useMap();

  const bounds = new LatLngBounds(
    locations.map((loc) => [loc.latitude!, loc.longitude!] as [number, number])
  );
  map.fitBounds(bounds, { padding: [30, 30] });

  return null;
}

export default function MapView({ locations }: Props) {
  const validLocations = locations.filter(
    (loc) => typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
  );

  if (validLocations.length === 0) return <p>No valid locations found.</p>;

  return (
    <div className="w-full h-[400px] z-0 rounded-xl overflow-hidden">
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[validLocations[0].latitude!, validLocations[0].longitude!]}
        zoom={6}
        scrollWheelZoom
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <AutoCenter locations={validLocations} />

        {validLocations.map((loc, i) => (
        <Marker key={loc.locationId ?? i} position={[loc.latitude!, loc.longitude!]}>
        <Tooltip permanent direction="top" offset={[0, -20]}>
            <span className="text-sm font-semibold">{loc.label ?? `Location ${i + 1}`}</span>
        </Tooltip>
        <Popup>
            <strong>{loc.label ?? `Location ${i + 1}`}</strong>
            <br />
            {loc.address}
        </Popup>
        </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
