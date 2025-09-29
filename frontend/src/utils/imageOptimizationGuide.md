# Image Optimization Guide for Plan Builder Header

## Current Image: PlanBuilderheader.jpg

### Recommended Optimizations

#### 1. Generate WebP Versions
```bash
# Using imagemagick or online tools, create these versions:
PlanBuilderheader.webp (original quality)
PlanBuilderheader-1920.webp (1920px width, desktop)
PlanBuilderheader-1280.webp (1280px width, tablet)
PlanBuilderheader-768.webp (768px width, mobile)
```

#### 2. Generate AVIF Versions (Next-gen format)
```bash
PlanBuilderheader.avif
PlanBuilderheader-1920.avif
PlanBuilderheader-1280.avif
PlanBuilderheader-768.avif
```

#### 3. Responsive Image Implementation
Replace the current img tag with this responsive picture element:

```jsx
<picture>
  {/* Desktop - AVIF */}
  <source 
    media="(min-width: 1280px)" 
    srcSet="src/assets/PlanBuilderheader-1920.avif" 
    type="image/avif" 
  />
  {/* Desktop - WebP */}
  <source 
    media="(min-width: 1280px)" 
    srcSet="src/assets/PlanBuilderheader-1920.webp" 
    type="image/webp" 
  />
  
  {/* Tablet - AVIF */}
  <source 
    media="(min-width: 768px)" 
    srcSet="src/assets/PlanBuilderheader-1280.avif" 
    type="image/avif" 
  />
  {/* Tablet - WebP */}
  <source 
    media="(min-width: 768px)" 
    srcSet="src/assets/PlanBuilderheader-1280.webp" 
    type="image/webp" 
  />
  
  {/* Mobile - AVIF */}
  <source 
    media="(max-width: 767px)" 
    srcSet="src/assets/PlanBuilderheader-768.avif" 
    type="image/avif" 
  />
  {/* Mobile - WebP */}
  <source 
    media="(max-width: 767px)" 
    srcSet="src/assets/PlanBuilderheader-768.webp" 
    type="image/webp" 
  />
  
  {/* Fallback */}
  <img
    src={PlanBuilderHeader}
    alt="Plan Builder - Professional gym workout planning with modern equipment and premium atmosphere"
    loading="eager"
    className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
    style={{ opacity: imageLoaded ? 1 : 0 }}
    onLoad={() => setImageLoaded(true)}
    fetchPriority="high"
    decoding="async"
  />
</picture>
```

#### 4. Compression Settings
- **JPEG**: Quality 85-90, Progressive encoding
- **WebP**: Quality 80-85, Lossless for graphics
- **AVIF**: Quality 75-80, Best compression

#### 5. File Size Targets
- Desktop (1920px): < 200KB
- Tablet (1280px): < 150KB  
- Mobile (768px): < 100KB

#### 6. Tools for Optimization

##### Online Tools:
- [Squoosh.app](https://squoosh.app/) - Google's image optimizer
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Cloudinary](https://cloudinary.com/) - Automated optimization

##### Command Line Tools:
```bash
# ImageMagick
magick PlanBuilderheader.jpg -resize 1920x -quality 85 PlanBuilderheader-1920.webp

# cwebp (WebP encoder)
cwebp -q 85 PlanBuilderheader.jpg -o PlanBuilderheader.webp

# avifenc (AVIF encoder)
avifenc --min 0 --max 63 -a end-usage=q -a cq-level=30 PlanBuilderheader.jpg PlanBuilderheader.avif
```

#### 7. Vite Configuration for Asset Optimization
Add to `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    assetsInlineLimit: 0, // Don't inline images
  },
  assetsInclude: ['**/*.webp', '**/*.avif']
});
```

#### 8. Performance Monitoring
Monitor Core Web Vitals:
- **LCP (Largest Contentful Paint)**: Should be < 2.5s
- **CLS (Cumulative Layout Shift)**: Should be < 0.1
- **FID (First Input Delay)**: Should be < 100ms

#### 9. Implementation Checklist
- [ ] Generate WebP versions at multiple sizes
- [ ] Generate AVIF versions for modern browsers
- [ ] Implement responsive picture element
- [ ] Add proper alt text for accessibility
- [ ] Test loading performance on slow connections
- [ ] Verify contrast ratios meet WCAG AA standards (4.5:1)
- [ ] Test with screen readers
- [ ] Validate responsive behavior across devices

#### 10. Accessibility Considerations
- Alt text describes the image content and context
- Sufficient contrast ratio for overlaid text (≥4.5:1)
- Respects prefers-reduced-motion for animations
- Keyboard navigation support for interactive elements
- Screen reader compatibility

This optimization will significantly improve loading performance while maintaining visual quality across all devices.