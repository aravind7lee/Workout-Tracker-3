import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePicture = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'workout_tracker');
    formData.append('folder', 'profile_pictures');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dtqahgnzn/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return await response.json();
  };

  const updateProfileInBackend = async (imageUrl) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/profile-picture`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ profileImage: imageUrl })
    });

    if (!response.ok) {
      throw new Error('Backend update failed');
    }

    return await response.json();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image must be less than 5MB');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(file);
      
      // Update backend
      await updateProfileInBackend(cloudinaryResult.secure_url);
      
      // Update local state
      onImageUpdate(cloudinaryResult.secure_url);
      
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.profileImage = cloudinaryResult.secure_url;
      localStorage.setItem('user', JSON.stringify(userData));
      
      setMessage('Profile picture updated successfully ✅');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Upload failed. Please try again');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Circle */}
      <div 
        onClick={handleImageClick}
        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group border-4 border-slate-600 hover:border-blue-500 transition-all duration-300"
      >
        {currentImage ? (
          <img 
            src={currentImage} 
            alt="Profile" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors duration-300">
            <div className="text-center">
              <div className="text-3xl text-slate-400 mb-1">👤</div>
              <div className="text-xs text-slate-400">Click to upload</div>
            </div>
          </div>
        )}
        
        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs">Change Photo</div>
          </div>
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-xs">Uploading...</div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Status Message */}
      {message && (
        <div className={`text-sm px-3 py-2 rounded-lg ${
          message.includes('✅') 
            ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
            : 'bg-red-900/30 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* User Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{user?.name || 'User'}</h3>
        <p className="text-sm text-slate-400">{user?.email || 'user@example.com'}</p>
      </div>
    </div>
  );
};

export default ProfilePicture;