"use client";

import React from "react";
import { ProductType } from "@/app/redux/services/types";

type ProductCardProps = {
  product: ProductType;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition cursor-default">
      <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
      <p className="text-gray-700 text-sm line-clamp-4">
        {product.description || "No description provided."}
      </p>
    </div>
  );
}
