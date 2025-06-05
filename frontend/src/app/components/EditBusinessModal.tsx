"use client";

import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name?: string;
    category?: string;
    description?: string;
    logo?: string;
  }) => void;
  initialData: {
    name?: string;
    category?: string;
    description?: string;
    logo?: string;
  };
}

const EditBusinessModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState(initialData.name || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [logo, setLogo] = useState(initialData.logo || "");

  const handleSubmit = () => {
    onSave({ name, category, description, logo });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-300 opacity-80 p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Business</h2>

        <input
          type="text"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Logo URL"
          value={logo}
          onChange={(e) => setLogo(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBusinessModal;
