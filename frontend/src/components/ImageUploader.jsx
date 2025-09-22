import React, { useState, useRef } from 'react';

const ImageUploader = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Using default preset
    formData.append('cloud_name', 'dtqahgnzn');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dtqahgnzn/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    return await response.json();
  };

  const updateBackend = async (imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return; // Skip backend update if no token
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/profile-picture`, {
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

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

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
      const imageUrl = cloudinaryResult.secure_url;
      
      // Update UI immediately
      onImageUpdate(imageUrl);
      
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.profileImage = imageUrl;
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Try to update backend (non-blocking)
      updateBackend(imageUrl);
      
      setMessage('Profile updated ✅');
      setTimeout(() => setMessage(''), 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback to base64 if Cloudinary fails
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          onImageUpdate(base64Image);
          
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.profileImage = base64Image;
          localStorage.setItem('user', JSON.stringify(userData));
          
          setMessage('Profile updated ✅');
          setTimeout(() => setMessage(''), 2000);
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        setMessage('Upload failed');
        setTimeout(() => setMessage(''), 3000);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div 
        onClick={() => fileInputRef.current?.click()}
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
        
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs">Change Photo</div>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-xs">Uploading...</div>
            </div>
          </div>
        )}
      </div>

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
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;