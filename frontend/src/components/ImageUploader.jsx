import React, { useState, useRef } from 'react';

const ImageUploader = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const uploadToBackend = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/upload-profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
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

    // Reset file input immediately to allow same file upload again
    event.target.value = '';

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Check file size (5MB = 5,242,880 bytes)
    if (file.size > 5242880) {
      setMessage(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`);
      setTimeout(() => setMessage(''), 4000);
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // Upload to backend with Cloudinary integration
      const uploadResult = await uploadToBackend(file);
      const imageUrl = uploadResult.profileImage;
      
      // Update UI immediately
      onImageUpdate(imageUrl);
      
      // Update localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.profileImage = imageUrl;
      localStorage.setItem('user', JSON.stringify(userData));
      
      setMessage('Profile photo updated successfully ✅');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Show specific error message
      if (error.message.includes('5MB')) {
        setMessage('File too large. Maximum size is 5MB.');
      } else if (error.message.includes('image')) {
        setMessage('Only image files are allowed.');
      } else {
        setMessage(error.message || 'Upload failed. Please try again.');
      }
      
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setUploading(false);
      // Reset file input again to ensure clean state
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            <div className="text-2xl mb-1" style={{display: 'none'}}>📷</div>
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