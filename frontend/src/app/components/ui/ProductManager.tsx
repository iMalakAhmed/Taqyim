"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetProductsByBusinessQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/app/redux/services/BusinessApi";

export default function ProductButton() {
  const { id } = useParams();
  const businessId = parseInt(id as string);

  const { data: products = [], refetch } = useGetProductsByBusinessQuery(businessId);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [editingProduct, setEditingProduct] = useState<{ name: string; description: string; id?: number } | null>(null);

  const handleSave = async () => {
    if (!editingProduct?.name.trim()) return;

    if (editingProduct.id) {
      await updateProduct({
        businessId,
        productId: editingProduct.id,
        body: {
          name: editingProduct.name,
          description: editingProduct.description,
        },
      });
    } else {
      await createProduct({
        businessId,
        body: {
          name: editingProduct.name,
          description: editingProduct.description,
        },
      });
    }

    setEditingProduct(null);
    refetch();
  };

  const handleDelete = async (id: number) => {
    await deleteProduct({ businessId, productId: id });
    refetch();
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Manage Products</h3>

      {products.map((p) => (
        <div key={p.productId} className="mb-2 border p-3 rounded flex justify-between items-start">
          <div>
            <div className="font-bold">{p.name}</div>
            <div className="text-sm text-gray-600">{p.description}</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingProduct({ id: p.productId, name: p.name, description: p.description || "" })}
              className="text-blue-600 hover:underline text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(p.productId)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Add or Edit Form */}
      {editingProduct ? (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Product Name"
            value={editingProduct.name}
            onChange={(e) => setEditingProduct((prev) => ({ ...prev!, name: e.target.value }))}
          />
          <textarea
            className="w-full mb-2 p-2 border rounded"
            placeholder="Description"
            value={editingProduct.description}
            onChange={(e) => setEditingProduct((prev) => ({ ...prev!, description: e.target.value }))}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-1 rounded">Save</button>
            <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:underline">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingProduct({ name: "", description: "" })}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      )}
    </div>
  );
}
