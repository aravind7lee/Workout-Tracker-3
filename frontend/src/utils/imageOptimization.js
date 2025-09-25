// Image optimization utility for WebP support and responsive images
export const getOptimizedImageSrc = (imageSrc, size = 'large') => {
  // Check if browser supports WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Generate responsive image sources
  const generateSrcSet = (baseSrc) => {
    const extension = baseSrc.split('.').pop();
    const baseName = baseSrc.replace(`.${extension}`, '');
    
    // For now, return the original image
    // In production, you would have multiple sizes generated
    return `${baseSrc} 1x, ${baseSrc} 2x`;
  };

  // Return optimized source
  if (supportsWebP()) {
    // In production, you would serve WebP versions
    return {
      src: imageSrc,
      srcSet: generateSrcSet(imageSrc),
      type: 'image/webp'
    };
  }

  return {
    src: imageSrc,
    srcSet: generateSrcSet(imageSrc),
    type: 'image/jpeg'
  };
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};