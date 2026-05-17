import { CheckCircle2, User, Camera } from 'lucide-react';
import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";


const ProfilePicture = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "workout_tracker");
    formData.append("folder", "profile_pictures");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dtqahgnzn/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    return await response.json();
  };
  const updateProfileInBackend = async (imageUrl) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE}/users/profile-picture`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileImage: imageUrl,
        }),
      },
    );
    if (!response.ok) {
      throw new Error("Backend update failed");
    }
    return await response.json();
  };
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be less than 5MB");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file);

      // Update backend
      await updateProfileInBackend(cloudinaryResult.secure_url);

      // Update local state
      onImageUpdate(cloudinaryResult.secure_url);

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      userData.profileImage = cloudinaryResult.secure_url;
      localStorage.setItem("user", JSON.stringify(userData));
      setMessage("Profile picture updated successfully ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploading(false);
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "flex flex-col items-center space-y-4",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        onClick: handleImageClick,
        className:
          "relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group border-4 border-neutral-700 hover:border-red-600 transition-all duration-300",
      },
      currentImage
        ? /*#__PURE__*/ React.createElement("img", {
            src: currentImage,
            alt: "Profile",
            className:
              "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
          })
        : /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "w-full h-full bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-700 transition-colors duration-300",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-center",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-3xl text-neutral-400 mb-1",
                },
                /*#__PURE__*/ React.createElement(User, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-neutral-400",
                },
                "Click to upload",
              ),
            ),
          ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-white text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl mb-1",
            },
            /*#__PURE__*/ React.createElement(Camera, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-xs",
            },
            "Change Photo",
          ),
        ),
      ),
      uploading &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-white text-center",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2",
            }),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-xs",
              },
              "Uploading...",
            ),
          ),
        ),
    ),
    /*#__PURE__*/ React.createElement("input", {
      ref: fileInputRef,
      type: "file",
      accept: "image/*",
      onChange: handleFileSelect,
      className: "hidden",
    }),
    message &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `text-sm px-3 py-2 rounded-lg ${message.includes("✅") ? "bg-green-900/30 text-red-500 border border-red-600/30" : "bg-red-900/30 text-red-400 border border-red-500/30"}`,
        },
        message,
      ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "text-center",
      },
      /*#__PURE__*/ React.createElement(
        "h3",
        {
          className: "text-lg font-semibold text-white",
        },
        user?.name || "User",
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-sm text-neutral-400",
        },
        user?.email || "user@example.com",
      ),
    ),
  );
};
export default ProfilePicture;
