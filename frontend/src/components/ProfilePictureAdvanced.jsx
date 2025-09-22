import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePictureAdvanced = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [displayImage, setDisplayImage] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { user, updateUser } = useAuth();

  // Update display image when props or user changes
  useEffect(() => {
    const imageToShow = currentImage || user?.profileImage;
    setDisplayImage(imageToShow);
  }, [currentImage, user?.profileImage]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB

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

      // Add current image to history
      if (currentImage && !history.includes(currentImage)) {
        setHistory(prev => [currentImage, ...prev.slice(0, 4)]);
      }

      // Simulate upload progress
      await simulateProgress();

      // Convert to base64 for storage
      const base64Image = await convertToBase64(file);
      
      // Update display immediately
      setDisplayImage(base64Image);
      
      // Update parent component
      onImageUpdate(base64Image);
      
      // Update user context and localStorage
      const updatedUser = { ...user, profileImage: base64Image };
      updateUser(updatedUser);
      
      setMessage('Profile updated ✅');
      setTimeout(() => setMessage(''), 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ ${error.message}`);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploading(true);
      
      // Add current image to history
      if (currentImage && !history.includes(currentImage)) {
        setHistory(prev => [currentImage, ...prev.slice(0, 4)]);
      }
      
      // Update display immediately
      setDisplayImage(null);
      
      // Update parent component
      onImageUpdate(null);
      
      // Update user context
      const updatedUser = { ...user, profileImage: null };
      updateUser(updatedUser);
      
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

  const handleRevertPhoto = (imageUrl) => {
    // Update display immediately
    setDisplayImage(imageUrl);
    
    // Update parent component
    onImageUpdate(imageUrl);
    
    // Update user context
    const updatedUser = { ...user, profileImage: imageUrl };
    updateUser(updatedUser);
    
    setMessage('Photo restored ✅');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture with Advanced Features */}
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
              onError={(e) => {
                console.error('Image load error:', e);
                setDisplayImage(null);
              }}
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center group-hover:bg-slate-600 transition-colors duration-300">
              <div className="text-center">
                <div className="text-3xl text-slate-400 mb-1">👤</div>
                <div className="text-xs text-slate-400">Click to upload</div>
              </div>
            </div>
          )}

          {/* Drag & Drop Overlay */}
          {dragOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-80 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-2xl mb-1">📤</div>
                <div className="text-xs">Drop to upload</div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
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
                    <div className="text-xs">Uploading...</div>
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

          {/* Action Buttons Overlay */}
          {(showOptions || isMobile) && !uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
                  title="Change Photo"
                >
                  ✏️
                </button>
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
                    ❌
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Click handler for the entire circle */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        />
      </div>

      {/* File Inputs */}
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

      {/* Status Message */}
      {message && (
        <div className={`text-sm px-4 py-2 rounded-full transition-all duration-300 ${
          message.includes('✅') 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* Photo History */}
      {history.length > 0 && (
        <div className="w-full max-w-sm">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Recent Photos</h4>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {history.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => handleRevertPhoto(imageUrl)}
                className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-slate-600 hover:border-blue-500 transition-colors"
                title="Revert to this photo"
              >
                <img 
                  src={imageUrl} 
                  alt={`Previous photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="text-center text-xs text-slate-500">
        <p>Supports all image formats • Maximum size: 5MB</p>
        <p>Drag & drop or click to upload</p>
      </div>

      {/* User Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{user?.name || 'User'}</h3>
        <p className="text-sm text-slate-400">{user?.email || 'user@example.com'}</p>
      </div>
    </div>
  );
};

export default ProfilePictureAdvanced;