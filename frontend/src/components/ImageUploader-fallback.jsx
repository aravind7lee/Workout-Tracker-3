import { CheckCircle2, User, Camera } from 'lucide-react';
import React, { useState, useRef } from "react";


const ImageUploader = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be less than 5MB");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      // Convert to base64 for local storage
      const base64Image = await convertToBase64(file);

      // Update local state
      onImageUpdate(base64Image);

      // Update localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      userData.profileImage = base64Image;
      localStorage.setItem("user", JSON.stringify(userData));
      setMessage("Updated ✅");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploading(false);
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "flex flex-col items-center space-y-3",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        onClick: () => fileInputRef.current?.click(),
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
          className: `text-sm px-3 py-1 rounded-full ${message.includes("✅") ? "bg-red-600/20 text-red-500" : "bg-red-500/20 text-red-400"}`,
        },
        message,
      ),
  );
};
export default ImageUploader;
