"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BusinessType } from "@/app/redux/services/types";

type BusinessCardProps = {
  business: BusinessType;
};

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      href={`/business/${business.businessId}`}
      className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-lg shadow hover:shadow-md transition cursor-pointer"
    >
      <div className="relative w-28 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
        <Image
          src={business.logo || "/default-business-logo.png"}
          alt={business.name}
          fill
          className="object-cover"
          sizes="112px"
          priority={false}
        />
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-primary hover:underline">
          {business.name}
        </h3>
        {business.category && (
          <span className="text-sm text-gray-500 mb-1">{business.category}</span>
        )}
        <p className="text-gray-700 line-clamp-3">{business.description || "No description available."}</p>
      </div>
    </Link>
  );
}
