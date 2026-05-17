// Image utility functions for the Analytics Gallery

// Function to preload images for better performance
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    }),
  );
};

// Function to generate WebP versions (for future optimization)
export const getOptimizedImageUrl = (
  originalUrl,
  format = "webp",
  quality = 80,
) => {
  // This would typically be handled by a build tool or CDN
  // For now, return the original URL
  return originalUrl;
};

// Function to get responsive image sizes
export const getResponsiveImageSizes = () => {
  return {
    mobile: "(max-width: 640px) 100vw",
    tablet: "(max-width: 1024px) 50vw",
    desktop: "33vw",
  };
};

// Function to validate image accessibility
export const validateImageAlt = (title, subtitle) => {
  return `${title} - ${subtitle}`.trim();
};

// Function to handle image loading errors gracefully
export const handleImageError = (event, fallbackIcon = "📊") => {
  const img = event.target;
  const container = img.closest(".analytics-gallery-card");

  if (container) {
    // Create fallback content
    const fallback = document.createElement("div");
    fallback.className =
      "flex items-center justify-center h-full bg-slate-700 text-4xl";
    fallback.textContent = fallbackIcon;
    fallback.setAttribute("aria-label", "Image unavailable");

    // Replace image with fallback
    img.parentNode.replaceChild(fallback, img);
  }
};

export default {
  preloadImages,
  getOptimizedImageUrl,
  getResponsiveImageSizes,
  validateImageAlt,
  handleImageError,
};
