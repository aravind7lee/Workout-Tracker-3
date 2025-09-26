import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Critical hero images that need preloading
const HERO_IMAGES = {
  '/': '/src/assets/Heroimg.jpg',
  '/dashboard': '/src/assets/Dashboardheader.jpg',
  '/my-plans': '/src/assets/Myplansheader.jpg',
  '/plan-builder': '/src/assets/PlanBuilderheader.jpg',
  '/nutrition': '/src/assets/Nutritionheader.jpg',
  '/analytics': '/src/assets/Progress-Analytics.jpg',
  '/library': '/src/assets/Libraryheader.jpg'
};

export default function ImagePreloader() {
  const location = useLocation();

  useEffect(() => {
    // Preload current page hero image
    const currentImage = HERO_IMAGES[location.pathname];
    if (currentImage) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = currentImage;
      link.fetchPriority = 'high';
      document.head.appendChild(link);

      return () => {
        // Cleanup
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [location.pathname]);

  // Preload likely next images on hover/interaction
  useEffect(() => {
    const preloadOnHover = (e) => {
      const link = e.target.closest('a[href]');
      if (link) {
        const href = link.getAttribute('href');
        const imageToPreload = HERO_IMAGES[href];
        if (imageToPreload) {
          const img = new Image();
          img.src = imageToPreload;
        }
      }
    };

    document.addEventListener('mouseenter', preloadOnHover, true);
    return () => document.removeEventListener('mouseenter', preloadOnHover, true);
  }, []);

  return null;
}