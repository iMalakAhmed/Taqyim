"use client";

import { useState } from "react";
import { useUploadMediaMutation } from "../redux/services/mediaApi";

export default function MediaUpload() {
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
      await uploadMedia({ file }).unwrap();
      alert("Upload successful!");
      setFile(null);
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
      {error && <p>Error uploading file</p>}
      {data && <p>Uploaded: {data.fileName}</p>}
    </div>
  );
}
