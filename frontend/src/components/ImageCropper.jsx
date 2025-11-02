import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, RotateCw, Check } from 'lucide-react';

const ImageCropper = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [cropPosition, setCropPosition] = useState({ x: 50, y: 50 });
  const [cropSize, setCropSize] = useState({ width: 200, height: 200 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState(350);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      
      // Calculate responsive container size - reserve space for controls
      const maxSize = Math.min(320, window.innerWidth - 80, window.innerHeight - 350);
      setContainerSize(maxSize);
      
      // Calculate image dimensions to fit container while maintaining aspect ratio
      const aspect = img.width / img.height;
      let displayWidth, displayHeight;
      
      // Always fit the entire image within the container
      if (aspect > 1) {
        // Landscape: fit width, calculate height
        displayWidth = maxSize;
        displayHeight = maxSize / aspect;
      } else {
        // Portrait: fit height, calculate width  
        displayHeight = maxSize;
        displayWidth = maxSize * aspect;
      }
      
      setImageDimensions({ width: displayWidth, height: displayHeight });
      
      // Center image in container
      setImagePosition({ 
        x: (maxSize - displayWidth) / 2, 
        y: (maxSize - displayHeight) / 2 
      });
      
      // Set initial crop size and position
      const cropSizeValue = Math.min(200, Math.min(displayWidth, displayHeight) * 0.8);
      setCropSize({ width: cropSizeValue, height: cropSizeValue });
      setCropPosition({ 
        x: (maxSize - cropSizeValue) / 2, 
        y: (maxSize - cropSizeValue) / 2 
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Image drag handlers
  const handleImageMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDraggingImage(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  }, [imagePosition]);

  // Crop drag handlers
  const handleCropMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCrop(true);
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    });
  }, [cropPosition]);

  // Resize handlers
  const handleResizeMouseDown = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    e.preventDefault();
    
    if (isDraggingImage) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Calculate bounds to keep image visible
      const scaledWidth = imageDimensions.width * scale;
      const scaledHeight = imageDimensions.height * scale;
      const minX = containerSize - scaledWidth;
      const maxX = 0;
      const minY = containerSize - scaledHeight;
      const maxY = 0;
      
      setImagePosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    } else if (isDraggingCrop) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setCropPosition({
        x: Math.max(0, Math.min(containerSize - cropSize.width, newX)),
        y: Math.max(0, Math.min(containerSize - cropSize.height, newY))
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setCropSize(prev => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        
        if (resizeHandle.includes('e')) newWidth += deltaX;
        if (resizeHandle.includes('w')) newWidth -= deltaX;
        if (resizeHandle.includes('s')) newHeight += deltaY;
        if (resizeHandle.includes('n')) newHeight -= deltaY;
        
        const size = Math.max(50, Math.min(containerSize - 20, Math.max(newWidth, newHeight)));
        return { width: size, height: size };
      });
      
      setCropPosition(prev => {
        let newX = prev.x;
        let newY = prev.y;
        
        if (resizeHandle.includes('w')) newX += deltaX;
        if (resizeHandle.includes('n')) newY += deltaY;
        
        return {
          x: Math.max(0, Math.min(containerSize - cropSize.width, newX)),
          y: Math.max(0, Math.min(containerSize - cropSize.height, newY))
        };
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDraggingImage, isDraggingCrop, isResizing, resizeHandle, dragStart, cropSize, imageDimensions, scale, containerSize]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingImage(false);
    setIsDraggingCrop(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  // Touch events
  const handleTouchStart = useCallback((e, type, handle = null) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    if (type === 'image') {
      setIsDraggingImage(true);
      setDragStart({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y
      });
    } else if (type === 'crop') {
      setIsDraggingCrop(true);
      setDragStart({
        x: touch.clientX - cropPosition.x,
        y: touch.clientY - cropPosition.y
      });
    } else if (type === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle);
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  }, [imagePosition, cropPosition]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    if (isDraggingImage) {
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      
      // Calculate bounds to keep image visible
      const scaledWidth = imageDimensions.width * scale;
      const scaledHeight = imageDimensions.height * scale;
      const minX = containerSize - scaledWidth;
      const maxX = 0;
      const minY = containerSize - scaledHeight;
      const maxY = 0;
      
      setImagePosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    } else if (isDraggingCrop) {
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      setCropPosition({
        x: Math.max(0, Math.min(containerSize - cropSize.width, newX)),
        y: Math.max(0, Math.min(containerSize - cropSize.height, newY))
      });
    } else if (isResizing && resizeHandle) {
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;
      
      setCropSize(prev => {
        let newWidth = prev.width;
        let newHeight = prev.height;
        
        if (resizeHandle.includes('e')) newWidth += deltaX;
        if (resizeHandle.includes('w')) newWidth -= deltaX;
        if (resizeHandle.includes('s')) newHeight += deltaY;
        if (resizeHandle.includes('n')) newHeight -= deltaY;
        
        const size = Math.max(50, Math.min(containerSize - 20, Math.max(newWidth, newHeight)));
        return { width: size, height: size };
      });
      
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  }, [isDraggingImage, isDraggingCrop, isResizing, resizeHandle, dragStart, cropSize, imageDimensions, scale, containerSize]);

  useEffect(() => {
    if (isDraggingImage || isDraggingCrop || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDraggingImage, isDraggingCrop, isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Handle window resize to maintain responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (image) {
        const maxSize = Math.min(320, window.innerWidth - 80, window.innerHeight - 350);
        setContainerSize(maxSize);
        
        // Recalculate image dimensions
        const aspect = image.width / image.height;
        let displayWidth, displayHeight;
        
        if (aspect > 1) {
          displayWidth = maxSize;
          displayHeight = maxSize / aspect;
        } else {
          displayHeight = maxSize;
          displayWidth = maxSize * aspect;
        }
        
        setImageDimensions({ width: displayWidth, height: displayHeight });
        
        // Reposition image to center
        setImagePosition({ 
          x: (maxSize - displayWidth) / 2, 
          y: (maxSize - displayHeight) / 2 
        });
        
        // Adjust crop position and size if needed
        setCropPosition(prev => ({
          x: Math.max(0, Math.min(maxSize - cropSize.width, prev.x)),
          y: Math.max(0, Math.min(maxSize - cropSize.height, prev.y))
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [image, cropSize]);

  const getCroppedImage = () => {
    if (!image || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
    
    // Calculate the scale factors between display and original image
    const scaleX = image.width / (imageDimensions.width * scale);
    const scaleY = image.height / (imageDimensions.height * scale);
    
    // Calculate source coordinates in original image
    const sourceX = Math.max(0, (cropPosition.x - imagePosition.x) * scaleX);
    const sourceY = Math.max(0, (cropPosition.y - imagePosition.y) * scaleY);
    const sourceWidth = Math.min(image.width - sourceX, cropSize.width * scaleX);
    const sourceHeight = Math.min(image.height - sourceY, cropSize.height * scaleY);
    
    // Clear canvas and draw cropped image
    ctx.clearRect(0, 0, 400, 400);
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 400, 400
    );
    
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleDone = () => {
    const croppedImage = getCroppedImage();
    if (croppedImage) onCropComplete(croppedImage);
  };

  if (!image) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl p-4 w-full max-w-md mx-auto">
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold text-white">Crop Photo</h3>
        </div>

        <div 
          ref={containerRef}
          className="relative mx-auto mb-3 bg-slate-800 rounded-lg overflow-hidden select-none"
          style={{ 
            width: `${containerSize}px`, 
            height: `${containerSize}px` 
          }}
        >
          {/* Image */}
          <div
            className="absolute cursor-move"
            style={{
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${scale})`,
              transformOrigin: 'top left',
              willChange: 'transform',
            }}
            onMouseDown={handleImageMouseDown}
            onTouchStart={(e) => handleTouchStart(e, 'image')}
          >
            <img
              src={imageUrl}
              alt="Crop"
              className="pointer-events-none select-none"
              style={{ 
                width: `${imageDimensions.width}px`,
                height: `${imageDimensions.height}px`
              }}
              draggable={false}
            />
          </div>

          {/* Crop overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Light overlay - shows original colors */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Crop window - clear view */}
            <div
              className="absolute bg-transparent border-2 border-white cursor-move pointer-events-auto"
              style={{
                left: cropPosition.x,
                top: cropPosition.y,
                width: cropSize.width,
                height: cropSize.height,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
              }}
              onMouseDown={handleCropMouseDown}
              onTouchStart={(e) => handleTouchStart(e, 'crop')}
            >
              {/* Corner handles */}
              <div
                className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize pointer-events-auto"
                style={{ top: -8, left: -8 }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                onTouchStart={(e) => handleTouchStart(e, 'resize', 'nw')}
              />
              <div
                className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize pointer-events-auto"
                style={{ top: -8, right: -8 }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                onTouchStart={(e) => handleTouchStart(e, 'resize', 'ne')}
              />
              <div
                className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize pointer-events-auto"
                style={{ bottom: -8, left: -8 }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                onTouchStart={(e) => handleTouchStart(e, 'resize', 'sw')}
              />
              <div
                className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize pointer-events-auto"
                style={{ bottom: -8, right: -8 }}
                onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                onTouchStart={(e) => handleTouchStart(e, 'resize', 'se')}
              />
              
              {/* Grid lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-0 w-full h-px bg-white/60" />
                <div className="absolute top-2/3 left-0 w-full h-px bg-white/60" />
                <div className="absolute left-1/3 top-0 w-px h-full bg-white/60" />
                <div className="absolute left-2/3 top-0 w-px h-full bg-white/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 mb-4 px-2">
          <button
            onClick={onCancel}
            className="text-white hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            Cancel
          </button>
          
          <button
            onClick={() => {
              setScale(1);
              if (image) {
                setImagePosition({ 
                  x: (containerSize - imageDimensions.width) / 2, 
                  y: (containerSize - imageDimensions.height) / 2 
                });
              }
            }}
            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors flex-shrink-0"
            title="Reset zoom and position"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={handleDone}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex-shrink-0"
          >
            Done
          </button>
        </div>
        
        {/* Zoom slider */}
        <div className="mb-4">
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={scale}
            onChange={(e) => {
              const newScale = parseFloat(e.target.value);
              setScale(newScale);
              
              // Adjust image position to keep it within bounds when scaling
              if (image) {
                const scaledWidth = imageDimensions.width * newScale;
                const scaledHeight = imageDimensions.height * newScale;
                
                setImagePosition(prev => {
                  const minX = containerSize - scaledWidth;
                  const maxX = 0;
                  const minY = containerSize - scaledHeight;
                  const maxY = 0;
                  
                  return {
                    x: Math.max(minX, Math.min(maxX, prev.x)),
                    y: Math.max(minY, Math.min(maxY, prev.y))
                  };
                });
              }
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>50%</span>
            <span className="text-white font-medium">{Math.round(scale * 100)}%</span>
            <span>300%</span>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;