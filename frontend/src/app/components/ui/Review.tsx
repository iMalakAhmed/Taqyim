"use client";

import Image from "next/image";
import HorizontalLine from "./HorizontalLine";

export default function Review() {
  const dummyReviews = [
    {
      reviewId: 1,
      comment: "This product is amazing!",
      user: {
        firstName: "Jane",
        lastName: "Doe",
        profilePic: "",
      },
      images: [
        {
          reviewImageId: 101,
          imageUrl: "/example1.jpg",
          caption: "Side view",
        },
        {
          reviewImageId: 102,
          imageUrl: "/example2.jpg",
          caption: "Packaging",
        },
      ],
    },
    {
      reviewId: 2,
      comment: "Not what I expected, but still okay.",
      user: {
        firstName: "John",
        lastName: "Smith",
        profilePic: "/john-avatar.png",
      },
      images: [],
    },
  ];

  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <span key={i}>{i < rating ? "★" : "☆"}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full h-full border flex flex-col p-10 text-text">
      <div className="flex flex-row">
        <Image
          src="/default-profile.jpg"
          width={40}
          height={40}
          alt="default profile"
          className="rounded-full w-20 h-20"
        />
        <div className="flex flex-col py-2 px-5">
          <h1 className="font-heading text-2xl">Jane Doe</h1>
          <p className="text-xs font-body pb-2">XX JUNE XXXX</p>
          <HorizontalLine className="w-96" />
        </div>
      </div>
      <p className="p-5">
        Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit...
      </p>
      <Image src="/review-typewriter-image.png" width={40} height={40} />
    </div>
  );
}
