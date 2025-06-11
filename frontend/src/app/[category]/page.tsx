"use client";

import { useParams, notFound } from "next/navigation";
import CategoryBusinesses from "@/app/components/CategoryBusinesses";

const validCategories = [
  "Food-Dining",
  "Health-Wellness",
  "Entertainment-Lifestyle",
  "Services-Professional",
  "Retail-Shopping",
  "Education-Technology",
];

export default function CategoryPage() {
  const { category } = useParams();

  if (!category || !validCategories.includes(category)) {
    return notFound();
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-8">{category.replace(/-/g, " ")} Businesses</h1>
      <CategoryBusinesses category={category} />
    </main>
  );
}
