import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileStorage } from '../utils/profileStorage';

const ProfilePictureAdvanced = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
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
          const updatedUser = { ...user, profileImage: savedPhoto };
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
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB limit

    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    if (file.size > maxSize) {
      throw new Error('Image must be under 5MB');
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
      setMessage('');

      await simulateProgress();

      const base64Image = await convertToBase64(file);
      
      setDisplayImage(base64Image);
      
      if (user?.email) {
        const success = await profileStorage.saveProfilePhoto(user.email, base64Image);
        if (!success) {
          setMessage('Photo saved with compression ✅');
        } else {
          setMessage('Photo saved successfully! ✅');
        }
      }
      
      if (onImageUpdate) {
        try {
          onImageUpdate(base64Image);
        } catch (e) {}
      }
      
      try {
        const updatedUser = { ...user, profileImage: base64Image };
        updateUser(updatedUser);
      } catch (e) {}
      
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      setMessage(`❌ ${error.message || 'Upload failed'}`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file inputs to allow new uploads
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
      // Reset file input to allow same file upload again
      event.target.value = '';
    } catch (error) {
      setMessage('❌ File selection failed');
      setTimeout(() => setMessage(''), 3000);
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
        const updatedUser = { ...user, profileImage: null };
        updateUser(updatedUser);
      } catch (e) {}
      
      setMessage('Photo removed ✅');
      setTimeout(() => setMessage(''), 2000);
      
    } catch (error) {
      setMessage('❌ Failed to remove photo');
      setTimeout(() => setMessage(''), 3000);
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
      setMessage('❌ Drop failed');
      setTimeout(() => setMessage(''), 3000);
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

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative group"
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={`relative w-32 h-32 rounded-full overflow-hidden cursor-pointer border-4 transition-all duration-300 ${
          dragOver ? 'border-blue-400 scale-105' : 'border-slate-600 hover:border-blue-500'
        }`}>
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={`Profile picture of ${user?.name || 'User'}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setDisplayImage(null)}
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors duration-300">
              <div className="text-center">
                <div className="text-3xl text-slate-400 mb-1">👤</div>
                <div className="text-xs text-slate-400">Click to upload</div>
              </div>
            </div>
          )}

          {dragOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-80 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl mb-1">📤</div>
                <div className="text-xs">Drop to upload</div>
              </div>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="text-white text-center">
                {progress > 0 ? (
                  <>
                    <div className="relative w-12 h-12 mx-auto mb-2">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-400"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${progress}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">{progress}%</span>
                      </div>
                    </div>
                    <div className="text-xs">Saving...</div>
                  </>
                ) : (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <div className="text-xs">Processing...</div>
                  </>
                )}
              </div>
            </div>
          )}

          {(showOptions || isMobile) && !uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="flex space-x-2">
                {isMobile && (
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors"
                    title="Take Photo"
                  >
                    📷
                  </button>
                )}
                {displayImage && (
                  <button
                    onClick={handleRemovePhoto}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                    title="Remove Photo"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {isMobile && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {message && (
        <div className={`text-sm px-4 py-2 rounded-full transition-all duration-300 ${
          message.includes('✅') 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
          disabled={uploading}
        >
          📤 Upload Photo
        </button>
        {displayImage && (
          <button
            onClick={handleRemovePhoto}
            className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
            disabled={uploading}
          >
            🗑️ Remove
          </button>
        )}
      </div>

      <div className="text-center text-xs text-slate-500">
        <p>Supports all image formats • Maximum size: 5MB</p>
        <p>Photos are automatically compressed and saved permanently</p>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{user?.name || 'User'}</h3>
        <p className="text-sm text-slate-400">{user?.email || 'user@example.com'}</p>
      </div>
    </div>
  );
};

export default ProfilePictureAdvanced;