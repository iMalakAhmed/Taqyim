"use client";

import { useState } from "react";
import {
  useUploadMediaMutation,
  useDeleteMediaMutation,
} from "../redux/services/mediaApi";

export type MediaUploadProps = {
  existingMedia?: Array<{
    mediaId: number;
    filePath: string;
    fileName: string;
  }>;
  reviewId?: number;
  onUploadSuccess?: (mediaId: number) => void;
  onDeleteSuccess?: (mediaId: number) => void;
};

export const getFullMediaUrl = (path: string) => `http://localhost:5273${path}`;

export default function MediaUpload({
  existingMedia = [],
  reviewId,
  onUploadSuccess,
  onDeleteSuccess,
}: MediaUploadProps) {
  const [uploadMedia, { isLoading: isUploading, error, data }] =
    useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    for (const file of fileArray) {
      try {
        const response = await uploadMedia({ file, reviewId }).unwrap();
        onUploadSuccess?.(response.mediaId);
      } catch {
        alert("Upload failed!");
      }
    }

    e.target.value = ""; // allow re-upload of same file
  };

  const handleDelete = async (mediaId: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this media?"
    );
    if (!confirmDelete) return;

    try {
      await deleteMedia(mediaId).unwrap();
      alert("Media deleted successfully!");
      onDeleteSuccess?.(mediaId);
    } catch {
      alert("Failed to delete media.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing media display with delete option */}
      {existingMedia.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingMedia.map((media) => (
            <div key={media.mediaId} className="relative group">
              <div className="w-32 h-32 rounded overflow-hidden border">
                <img
                  src={getFullMediaUrl(media.filePath)}
                  alt={media.fileName}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(media.mediaId);
                }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File input and upload button */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          multiple
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleFileChange(e);
          }}
          className="border p-2 rounded"
        />
        <button
          type="button"
          onClick={() => {}} // placeholder (not needed with auto upload)
          disabled={isUploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">Error uploading file</p>}
      {data && (
        <p className="text-green-500 text-sm">Uploaded: {data.fileName}</p>
      )}
    </div>
  );
}
