// frontend/src/components/ImageUploader.jsx
import React, { useState } from 'react';
import api from '../utils/api';

export default function ImageUploader({ currentImage, onImageUpdate, className = "" }) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(currentImage);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('📁 Selected file:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Validate file type - accept all image formats
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload profile image');
        setUploading(false);
        return;
      }

      console.log('🚀 Starting upload to Cloudinary...');

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('profileImage', file);
      
      // Upload to Cloudinary via backend API
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 // 30 second timeout for large files
      });

      console.log('✅ Upload response:', response.data);

      if (response.data.success) {
        // Update preview with Cloudinary URL
        setPreviewImage(response.data.profileImage);
        
        // Update localStorage with server response
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Call parent callback
        if (onImageUpdate) {
          onImageUpdate(response.data.profileImage, userData);
        }
        
        alert('Profile image uploaded to Cloudinary successfully!');
        console.log('🌐 Cloudinary URL:', response.data.cloudinaryUrl);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error.code === 'ECONNABORTED') {
        alert('Upload timeout. Please try with a smaller image or check your internet connection.');
      } else if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 413) {
        alert('Image file is too large. Please select an image under 5MB.');
      } else if (error.response?.data?.message) {
        alert(`Upload failed: ${error.response.data.message}`);
      } else {
        alert('Failed to upload image to Cloudinary. Please check your internet connection and try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden flex-shrink-0 border-4 border-slate-600">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image load error:', e);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center text-3xl sm:text-4xl text-white ${
            previewImage ? 'hidden' : 'flex'
          }`}
        >
          👤
        </div>
      </div>
      
      {/* Upload Button */}
      <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <span className="text-white text-sm">📷</span>
        )}
      </label>
      
      {/* Upload Status */}
      {uploading && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 whitespace-nowrap">
          Uploading to Cloudinary...
        </div>
      )}
      
      {/* File Size Info */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
        Max 5MB • All formats
      </div>
    </div>
  );
}