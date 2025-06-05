"use client";

import Image from "next/image";
import HorizontalLine from "./HorizontalLine";
import { useGetCurrentUserQuery, CurrentUserResponse } from "../../redux/services/authApi";

export default function Review() {
  const { data: user, isLoading, error } = useGetCurrentUserQuery();

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? "★" : "☆"}</span>
        ))}
      </div>
    );
  }

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Error loading user profile.</div>;

  if (!user) return null;

  return (
    <div className="w-full h-full border flex flex-col p-10 text-text">
      <div className="flex flex-row">
        <Image
          src="/default-profile.jpg"
          width={80}
          height={80}
          alt="user profile"
          className="rounded-full w-20 h-20"
        />
        <div className="flex flex-col py-2 px-5">
          <h1 className="font-heading text-2xl">{user.firstName} {user.lastName}</h1>
          <p className="text-xs font-body pb-2">XX JUNE XXXX</p>
          <HorizontalLine className="w-96" />
        </div>
      </div>
      <p className="p-5">
        Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit...
      </p>
      <Image src="/review-typewriter-image.png" width={40} height={40} alt="Review image"/>
    </div>
  );
}
