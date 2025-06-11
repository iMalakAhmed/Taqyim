"use client";

import { useEffect, useState } from "react";
import { useGetAllBusinessesQuery } from "@/app/redux/services/BusinessApi";
import { useGetReviewsQuery } from "@/app/redux/services/reviewApi";
import ReviewCard from "@/app/components/ui/ReviewCard";
import Link from "next/link";

type Location = {
  latitude: number;
  longitude: number;
};

const NEARBY_RADIUS_KM = 10;

export default function ExplorePage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: businesses = [], isLoading: loadingBusinesses } =
    useGetAllBusinessesQuery();
  const { data: reviews = [], isLoading: loadingReviews } =
    useGetReviewsQuery();

  // Request geolocation once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setError("Location permission denied or unavailable.")
    );
  }, []);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      0.5 -
      Math.cos(dLat) / 2 +
      (Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        (1 - Math.cos(dLon))) /
        2;
    return R * 2 * Math.asin(Math.sqrt(a));
  };

  const nearbyBusinesses = userLocation
    ? businesses.filter((b) =>
        b.businessLocations?.some(
          (loc) =>
            loc.latitude != null &&
            loc.longitude != null &&
            getDistance(
              userLocation.latitude,
              userLocation.longitude,
              loc.latitude,
              loc.longitude
            ) < NEARBY_RADIUS_KM
        )
      )
    : [];

  //   const nearbyReviews = Array.isArray(reviews)
  //     ? reviews.filter((r) => {
  //         const loc = r.business?.businessLocations?.[0];
  //         return (
  //           loc &&
  //           loc.latitude != null &&
  //           loc.longitude != null &&
  //           getDistance(
  //             userLocation.latitude,
  //             userLocation.longitude,
  //             loc.latitude,
  //             loc.longitude
  //           ) < NEARBY_RADIUS_KM
  //         );
  //       })
  //     : [];

  return (
    <main className="w-full min-h-screen bg-background text-text pt-24 p-96">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Explore Near You</h1>

        {error && <p className="text-red-500">{error}</p>}
        {!userLocation && !error && (
          <p className="text-sm">Getting your location...</p>
        )}

        {userLocation && (
          <>
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">Nearby Businesses</h2>
              {loadingBusinesses ? (
                <p>Loading businesses...</p>
              ) : nearbyBusinesses.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No nearby businesses found.
                </p>
              ) : (
                <div className="space-y-3">
                  {nearbyBusinesses.map((b) => (
                    <Link href={`/Business/${b.businessId}`} key={b.businessId}>
                      <div className="p-4 border rounded-lg hover:shadow cursor-pointer transition">
                        <h3 className="text-base font-semibold">{b.name}</h3>
                        <p className="text-sm text-muted">{b.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* <section>
              <h2 className="text-2xl font-semibold mb-3">Nearby Reviews</h2>
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : nearbyReviews.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No nearby reviews found.
                </p>
              ) : (
                <div className="space-y-4">
                  {nearbyReviews.map((r) => (
                    <ReviewCard key={r.reviewId} reviewId={r.reviewId} />
                  ))}
                </div>
              )}
            </section> */}
          </>
        )}
      </div>
    </main>
  );
}
