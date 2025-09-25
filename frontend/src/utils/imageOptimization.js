// Image Optimization Utilities for Production
// This file provides utilities for handling responsive images and optimization

/**
 * Generate srcset for responsive images
 * @param {string} basePath - Base path to the image
 * @param {string} filename - Image filename without extension
 * @param {string} extension - Image extension
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} - Formatted srcset string
 */
export const generateSrcSet = (basePath, filename, extension, widths = [480, 768, 1024, 1440]) => {
  return widths
    .map(width => `${basePath}/${filename}-${width}.${extension} ${width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param {Object} breakpoints - Object with breakpoint definitions
 * @returns {string} - Formatted sizes string
 */
export const generateSizes = (breakpoints = {
  mobile: '100vw',
  tablet: '100vw', 
  desktop: '100vw'
}) => {
  return [
    `(max-width: 768px) ${breakpoints.mobile}`,
    `(max-width: 1024px) ${breakpoints.tablet}`,
    breakpoints.desktop
  ].join(', ');
};

/**
 * Preload critical images
 * @param {string} src - Image source
 * @param {string} srcset - Image srcset
 * @param {string} sizes - Image sizes
 */
export const preloadImage = (src, srcset = '', sizes = '') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.fetchPriority = 'high';
  
  if (srcset) {
    link.imageSrcset = srcset;
  }
  
  if (sizes) {
    link.imageSizes = sizes;
  }
  
  document.head.appendChild(link);
};

/**
 * Create optimized picture element configuration
 * @param {string} src - Fallback image source
 * @param {string} alt - Alt text
 * @param {Object} options - Configuration options
 * @returns {Object} - Picture element configuration
 */
export const createPictureConfig = (src, alt, options = {}) => {
  const {
    webpSrc = '',
    avifSrc = '',
    srcset = '',
    sizes = '100vw',
    loading = 'lazy',
    decoding = 'async',
    fetchPriority = 'auto'
  } = options;

  return {
    sources: [
      ...(avifSrc ? [{
        srcSet: avifSrc,
        type: 'image/avif',
        sizes
      }] : []),
      ...(webpSrc ? [{
        srcSet: webpSrc,
        type: 'image/webp',
        sizes
      }] : [])
    ],
    img: {
      src,
      alt,
      srcSet: srcset,
      sizes,
      loading,
      decoding,
      fetchPriority
    }
  };
};

/**
 * Lazy load image with intersection observer
 * @param {HTMLImageElement} img - Image element
 * @param {Object} options - Intersection observer options
 */
export const lazyLoadImage = (img, options = {}) => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    loadImage(img);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });

  observer.observe(img);
};

/**
 * Load image and handle loading states
 * @param {HTMLImageElement} img - Image element
 */
const loadImage = (img) => {
  const src = img.dataset.src || img.src;
  const srcset = img.dataset.srcset;

  if (srcset) {
    img.srcset = srcset;
  }
  
  img.src = src;
  img.classList.add('loading');

  img.onload = () => {
    img.classList.remove('loading');
    img.classList.add('loaded');
  };

  img.onerror = () => {
    img.classList.remove('loading');
    img.classList.add('error');
  };
};

/**
 * Generate LQIP (Low Quality Image Placeholder) data URL
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} color - Base color (hex)
 * @returns {string} - Data URL for placeholder
 */
export const generateLQIP = (width = 40, height = 20, color = '#475569') => {
  if (typeof document === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color + '40');
  gradient.addColorStop(0.5, color + '60');
  gradient.addColorStop(1, color + '40');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Check if WebP is supported
 * @returns {Promise<boolean>} - WebP support status
 */
export const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Check if AVIF is supported
 * @returns {Promise<boolean>} - AVIF support status
 */
export const supportsAVIF = () => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
  });
};

// Export default configuration for Analytics hero
export const analyticsHeroConfig = {
  basePath: '/src/assets',
  filename: 'Progress & Analytics',
  formats: ['avif', 'webp', 'jpg'],
  widths: [480, 768, 1024, 1440],
  sizes: '100vw',
  quality: {
    avif: 60,
    webp: 70,
    jpg: 80
  }
};