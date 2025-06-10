"use client";

import React, { useState } from "react";
import HorizontalLine from "./HorizontalLine";
import Button from "./Button";
import { IconX } from "@tabler/icons-react";
import MediaUpload, { getFullMediaUrl } from "../MediaUpload";
import { useDeleteMediaMutation } from "@/app/redux/services/mediaApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    userName: string;
    bio?: string;
    profilePic?: string;
  }) => void;
  initialData: {
    userName: string;
    bio?: string;
    profilePic?: string;
  };
}

const EditProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [userName, setUserName] = useState(initialData.userName);
  const [bio, setBio] = useState(initialData.bio || "");
  const [profilePic, setProfilePic] = useState(initialData.profilePic || "");
  const [profilePicId, setProfilePicId] = useState<number | null>(null);

  const [deleteMedia] = useDeleteMediaMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ userName, bio, profilePic });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-999 bg-black/30 backdrop-invert-25"
      onClick={onClose}
    >
      <div
        className="bg-background shadow-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          aria-label="Close modal"
          variant="none"
          size="sm"
          className="absolute top-2 right-2 hover:text-accent"
        >
          <IconX />
        </Button>

        <h2 className="text-xl font-semibold mb-2">Edit Profile</h2>
        <HorizontalLine />

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Username */}
          <div>
            <label htmlFor="userName" className="block font-medium mb-1">
              User Name <span className="text-accent">*</span>
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none"
              required
            />
            <HorizontalLine className="mt-5" />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none resize-none"
              rows={3}
            />
            <HorizontalLine className="mt-5" />
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block font-medium mb-1">
              Upload Profile Picture
            </label>
            <MediaUpload
              onUploadSuccess={(mediaId) => {
                fetch(`/api/media/${mediaId}`)
                  .then((res) => res.json())
                  .then((media) => {
                    setProfilePic(media.filePath);
                    setProfilePicId(media.mediaId);
                  });
              }}
              onDeleteSuccess={() => {
                setProfilePic("");
                setProfilePicId(null);
              }}
            />

            {profilePic && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <img
                  src={getFullMediaUrl(profilePic)}
                  alt="Profile Preview"
                  className="w-20 h-20 object-cover border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (
                      profilePicId &&
                      confirm("Delete this profile picture?")
                    ) {
                      try {
                        await deleteMedia(profilePicId).unwrap();
                        setProfilePic("");
                        setProfilePicId(null);
                      } catch {
                        alert("Failed to delete image");
                      }
                    } else {
                      setProfilePic("");
                      setProfilePicId(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
            <HorizontalLine className="mt-5" />
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!userName.trim()}>
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
