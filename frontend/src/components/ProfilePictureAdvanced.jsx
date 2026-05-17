import { CheckCircle2, XCircle, User, Upload, Camera, Trash2 } from 'lucide-react';
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { profileStorage } from "../utils/profileStorage";


const ProfilePictureAdvanced = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [displayImage, setDisplayImage] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { user, updateUser } = useAuth();

  // Load profile photo safely
  useEffect(() => {
    try {
      let imageToShow = currentImage || user?.profileImage;
      if (!imageToShow && user?.email) {
        const savedPhoto = profileStorage.getProfilePhoto(user.email);
        if (savedPhoto && user.profileImage !== savedPhoto) {
          const updatedUser = {
            ...user,
            profileImage: savedPhoto,
          };
          updateUser(updatedUser);
          imageToShow = savedPhoto;
        }
      }
      if (displayImage !== imageToShow) {
        setDisplayImage(imageToShow);
      }
    } catch (error) {
      // Silent error handling
    }
  }, [currentImage, user?.email]);
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    if (!file.type.startsWith("image/")) {
      throw new Error("Please select an image file");
    }
    if (file.size > maxSize) {
      throw new Error("Image must be under 5MB");
    }
    return true;
  };
  const simulateProgress = () => {
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setProgress(Math.floor(currentProgress));
        }
      }, 100);
    });
  };
  const handleFileUpload = async (file) => {
    try {
      validateFile(file);
      setUploading(true);
      setProgress(0);
      setMessage("");
      await simulateProgress();
      const base64Image = await convertToBase64(file);
      setDisplayImage(base64Image);
      if (user?.email) {
        const success = await profileStorage.saveProfilePhoto(
          user.email,
          base64Image,
        );
        if (!success) {
          setMessage("Photo saved with compression ✅");
        } else {
          setMessage("Photo saved successfully! ✅");
        }
      }
      if (onImageUpdate) {
        try {
          onImageUpdate(base64Image);
        } catch (e) {}
      }
      try {
        const updatedUser = {
          ...user,
          profileImage: base64Image,
        };
        updateUser(updatedUser);
      } catch (e) {}
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`❌ ${error.message || "Upload failed"}`);
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file inputs to allow new uploads
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };
  const handleFileSelect = (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
      // Reset file input to allow same file upload again
      event.target.value = "";
    } catch (error) {
      setMessage("❌ File selection failed");
      setTimeout(() => setMessage(""), 3000);
    }
  };
  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      setDisplayImage(null);
      if (user?.email) {
        profileStorage.removeProfilePhoto(user.email);
      }
      if (onImageUpdate) {
        try {
          onImageUpdate(null);
        } catch (e) {}
      }
      try {
        const updatedUser = {
          ...user,
          profileImage: null,
        };
        updateUser(updatedUser);
      } catch (e) {}
      setMessage("Photo removed ✅");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage("❌ Failed to remove photo");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUploading(false);
      setShowOptions(false);
    }
  };
  const handleDrop = useCallback((e) => {
    try {
      e.preventDefault();
      setDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileUpload(files[0]);
      }
    } catch (error) {
      setMessage("❌ Drop failed");
      setTimeout(() => setMessage(""), 3000);
    }
  }, []);
  const handleDragOver = useCallback((e) => {
    try {
      e.preventDefault();
      setDragOver(true);
    } catch (error) {}
  }, []);
  const handleDragLeave = useCallback((e) => {
    try {
      e.preventDefault();
      setDragOver(false);
    } catch (error) {}
  }, []);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "flex flex-col items-center space-y-4",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative group",
        onMouseEnter: () => setShowOptions(true),
        onMouseLeave: () => setShowOptions(false),
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 transition-all duration-300 ${dragOver ? "border-red-500 scale-105" : "border-neutral-700 hover:border-red-600"}`,
        },
        displayImage
          ? /*#__PURE__*/ React.createElement("img", {
              src: displayImage,
              alt: `Profile picture of ${user?.name || "User"}`,
              className:
                "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
              onError: () => setDisplayImage(null),
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
        dragOver &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "absolute inset-0 bg-red-600 bg-opacity-80 flex items-center justify-center",
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
                /*#__PURE__*/ React.createElement(Upload, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs",
                },
                "Drop to upload",
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
              progress > 0
                ? /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "relative w-12 h-12 mx-auto mb-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "svg",
                        {
                          className: "w-12 h-12 transform -rotate-90",
                          viewBox: "0 0 36 36",
                        },
                        /*#__PURE__*/ React.createElement("path", {
                          className: "text-neutral-700",
                          stroke: "currentColor",
                          strokeWidth: "3",
                          fill: "none",
                          d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831",
                        }),
                        /*#__PURE__*/ React.createElement("path", {
                          className: "text-red-500",
                          stroke: "currentColor",
                          strokeWidth: "3",
                          strokeDasharray: `${progress}, 100`,
                          strokeLinecap: "round",
                          fill: "none",
                          d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "absolute inset-0 flex items-center justify-center",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xs font-bold",
                          },
                          progress,
                          "%",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs",
                      },
                      "Saving...",
                    ),
                  )
                : /*#__PURE__*/ React.createElement(
                    React.Fragment,
                    null,
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs",
                      },
                      "Processing...",
                    ),
                  ),
            ),
          ),
        (showOptions || isMobile) &&
          !uploading &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex space-x-2",
              },
              isMobile &&
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => cameraInputRef.current?.click(),
                    className:
                      "p-2 bg-red-600 hover:bg-green-600 rounded-full text-white transition-colors",
                    title: "Take Photo",
                    style: {
                      display: "none",
                    },
                  },
                  /*#__PURE__*/ React.createElement(Camera, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
              displayImage &&
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: handleRemovePhoto,
                    className:
                      "p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors",
                    title: "Remove Photo",
                    style: {
                      display: "none",
                    },
                  },
                  /*#__PURE__*/ React.createElement(Trash2, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
            ),
          ),
      ),
      /*#__PURE__*/ React.createElement("div", {
        className: "absolute inset-0 cursor-pointer",
        onClick: () => fileInputRef.current?.click(),
      }),
    ),
    /*#__PURE__*/ React.createElement("input", {
      ref: fileInputRef,
      type: "file",
      accept: "image/*",
      onChange: handleFileSelect,
      className: "hidden",
    }),
    isMobile &&
      /*#__PURE__*/ React.createElement("input", {
        ref: cameraInputRef,
        type: "file",
        accept: "image/*",
        capture: "user",
        onChange: handleFileSelect,
        className: "hidden",
      }),
    message &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `text-sm px-4 py-2 rounded-full transition-all duration-300 ${message.includes("✅") ? "bg-red-600/20 text-red-500 border border-red-600/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`,
        },
        message,
      ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex space-x-2",
      },
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          className: "btn bg-red-700 hover:bg-blue-700 text-white text-sm",
          disabled: uploading,
        },
        /*#__PURE__*/ React.createElement(Upload, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        " Upload Photo",
      ),
      displayImage &&
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: handleRemovePhoto,
            className: "btn bg-red-600 hover:bg-red-700 text-white text-sm",
            disabled: uploading,
          },
          /*#__PURE__*/ React.createElement(Trash2, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Remove",
        ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "text-center text-xs text-neutral-500",
      },
      /*#__PURE__*/ React.createElement(
        "p",
        null,
        "Supports all image formats \u2022 Maximum size: 5MB",
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        null,
        "Photos are automatically compressed and saved permanently",
      ),
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
export default ProfilePictureAdvanced;
