import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

const ImageUploader = ({ currentImage, onImageUpdate, onImageClick }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiBase}/users/upload-profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Upload failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Upload failed (${response.status})`;
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch {
      throw new Error('Invalid response from server');
    }
  };

  const updateBackend = async (imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      const response = await fetch(`${apiBase}/users/profile-picture`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileImage: imageUrl })
      });

      if (response.ok) {
        console.log('Backend updated successfully');
      }
    } catch (error) {
      console.warn('Backend update failed, but image is saved locally:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = '';

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl) => {
    setShowCropper(false);
    setSelectedImage(null);
    onImageUpdate(croppedImageUrl);
    
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    userData.profileImage = croppedImageUrl;
    localStorage.setItem('user', JSON.stringify(userData));
    
    setMessage('✅ Updated');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-700 hover:border-red-600 transition-all duration-300">
          {/* Base image - always visible */}
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover cursor-pointer"
              onClick={onImageClick}
            />
          ) : (
            <div 
              className="w-full h-full bg-neutral-800 flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <div className="text-3xl text-neutral-400 mb-1">👤</div>
                <div className="text-xs text-neutral-400">Click to upload</div>
              </div>
            </div>
          )}

          {/* Upload loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-30">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <div className="text-xs">Processing...</div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {currentImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-red-700 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2"
          >
            📷 Change Photo
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {message && (
          <div className={`text-sm px-3 py-1 rounded-full ${
            message.includes('✅') 
              ? 'bg-red-600/20 text-red-500' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Image Cropper Modal - Always render when needed */}
      {showCropper && selectedImage ? (
        <ImageCropper
          imageUrl={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      ) : null}
    </>
  );
};

export default ImageUploader;