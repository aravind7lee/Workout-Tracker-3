// Image Optimization Utilities for Nutrition Gallery

/**
 * Image Optimization Guide for Nutrition Gallery
 *
 * For best performance, consider:
 * 1. Convert images to WebP format for better compression
 * 2. Create multiple sizes for responsive loading
 * 3. Use lazy loading for images below the fold
 * 4. Implement proper alt text for accessibility
 */

// Recommended image sizes for responsive design
export const IMAGE_SIZES = {
  mobile: { width: 400, height: 300 },
  tablet: { width: 600, height: 450 },
  desktop: { width: 800, height: 600 },
};

// WebP support detection
export const supportsWebP = () => {
  if (typeof window === "undefined") return false;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
};

// Generate srcSet for responsive images
export const generateSrcSet = (imageName, extension = "jpg") => {
  const webpSupported = supportsWebP();
  const format = webpSupported ? "webp" : extension;

  return [
    `${imageName}-400w.${format} 400w`,
    `${imageName}-600w.${format} 600w`,
    `${imageName}-800w.${format} 800w`,
  ].join(", ");
};

// Image loading with fallback
export const loadImageWithFallback = (primarySrc, fallbackSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(primarySrc);
    img.onerror = () => {
      // Try fallback
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackSrc);
      fallbackImg.onerror = () =>
        reject(new Error("Both images failed to load"));
      fallbackImg.src = fallbackSrc;
    };

    img.src = primarySrc;
  });
};

// Preload critical images
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to preload ${url}`));
        img.src = url;
      });
    }),
  );
};

// Image optimization recommendations
export const OPTIMIZATION_TIPS = {
  webp: {
    title: "Convert to WebP",
    description: "Use WebP format for 25-35% smaller file sizes",
    command: "cwebp -q 80 input.jpg -o output.webp",
  },

  responsive: {
    title: "Create Multiple Sizes",
    description: "Generate 400px, 600px, and 800px wide versions",
    sizes: ["400w", "600w", "800w"],
  },

  compression: {
    title: "Optimize Compression",
    description: "Use 80-85% quality for best size/quality balance",
    quality: "80-85%",
  },

  lazy: {
    title: "Implement Lazy Loading",
    description: "Load images only when they enter the viewport",
    attribute: 'loading="lazy"',
  },
};

export default {
  IMAGE_SIZES,
  supportsWebP,
  generateSrcSet,
  loadImageWithFallback,
  preloadImages,
  OPTIMIZATION_TIPS,
};
