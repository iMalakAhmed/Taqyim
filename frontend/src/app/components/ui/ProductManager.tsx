"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  useGetProductsByBusinessQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/app/redux/services/BusinessApi";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import Button from "./Button";

export default function ProductButton() {
  const { id } = useParams();
  const businessId = parseInt(id as string);

  const { data: products = [], refetch } =
    useGetProductsByBusinessQuery(businessId);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [editingProduct, setEditingProduct] = useState<{
    name: string;
    description: string;
    id?: number;
  } | null>(null);

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
    <div className="">
      <h3 className="text-xl font-semibold font-heading mb-4">
        Manage Products
      </h3>

      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.productId}
            className=" p-4  flex justify-between items-center transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-text">{p.name}</div>
              {p.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {p.description}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  setEditingProduct({
                    id: p.productId,
                    name: p.name,
                    description: p.description || "",
                  })
                }
                variant="primary"
                size="sm"
                className="flex items-center gap-1"
              >
                <IconEdit size={16} />
                <span>Edit</span>
              </Button>
              <Button
                onClick={() => handleDelete(p.productId)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 "
              >
                <IconTrash size={16} />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add or Edit Form */}
      {editingProduct ? (
        <div className="mt-6 p-4 border rounded-lg ">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-accent">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Product Name"
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct((prev) => ({
                    ...prev!,
                    name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Description"
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct((prev) => ({
                    ...prev!,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setEditingProduct(null)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={!editingProduct.name.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() =>
            setEditingProduct({ id: null, name: "", description: "" })
          }
          variant="secondary"
          className="w-full"
        >
          <IconPlus size={18} />
          Add Product
        </Button>
      )}
    </div>
  );
}
