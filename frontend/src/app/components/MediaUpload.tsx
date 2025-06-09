"use client";

import { useState } from "react";
import { useUploadMediaMutation } from "../redux/services/mediaApi";

type MediaUploadProps = {
  onUploadSuccess?: (mediaId: number) => void;
};

export default function MediaUpload({ onUploadSuccess }: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMedia, { isLoading, data, error }] = useUploadMediaMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const response = await uploadMedia({ file }).unwrap();
      alert("Upload successful!");
      setFile(null);
      onUploadSuccess?.(response.mediaId); // Ensure your response includes `mediaId`
    } catch {
      alert("Upload failed!");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file || isLoading}>
        Upload
      </button>
      {error && <p className="text-sm text-accent">Error uploading file</p>}
      {data && (
        <p className="text-sm text-secondary">Uploaded: {data.fileName}</p>
      )}
    </div>
  );
}
