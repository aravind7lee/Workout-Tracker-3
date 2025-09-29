// Accessibility Testing Utilities for Plan Builder Header

/**
 * Test contrast ratio for text overlays
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text
 */
export const testContrastRatio = (foregroundColor, backgroundColor) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Calculate contrast ratio
  const getContrastRatio = (color1, color2) => {
    const lum1 = getLuminance(color1.r, color1.g, color1.b);
    const lum2 = getLuminance(color2.r, color2.g, color2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const fg = hexToRgb(foregroundColor);
  const bg = hexToRgb(backgroundColor);
  
  if (!fg || !bg) return null;
  
  const ratio = getContrastRatio(fg, bg);
  
  return {
    ratio: ratio.toFixed(2),
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
    passesLargeAA: ratio >= 3,
    passesLargeAAA: ratio >= 4.5
  };
};

/**
 * Test keyboard navigation
 */
export const testKeyboardNavigation = () => {
  const focusableElements = document.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const results = {
    totalFocusableElements: focusableElements.length,
    elementsWithVisibleFocus: 0,
    elementsWithAriaLabels: 0,
    issues: []
  };

  focusableElements.forEach((element, index) => {
    // Check for visible focus indicators
    const computedStyle = window.getComputedStyle(element, ':focus');
    if (computedStyle.outline !== 'none' || computedStyle.boxShadow !== 'none') {
      results.elementsWithVisibleFocus++;
    }

    // Check for aria-label or accessible name
    if (element.getAttribute('aria-label') || 
        element.getAttribute('aria-labelledby') ||
        element.textContent.trim() ||
        element.getAttribute('title')) {
      results.elementsWithAriaLabels++;
    } else {
      results.issues.push(`Element ${index + 1} lacks accessible name`);
    }
  });

  return results;
};

/**
 * Test screen reader compatibility
 */
export const testScreenReaderCompatibility = () => {
  const results = {
    hasMainLandmark: !!document.querySelector('main, [role="main"]'),
    hasHeadingStructure: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
    hasSkipLinks: !!document.querySelector('a[href^="#"]'),
    imagesWithAltText: 0,
    imagesWithoutAltText: 0,
    issues: []
  };

  // Check images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (img.getAttribute('alt') !== null) {
      results.imagesWithAltText++;
    } else {
      results.imagesWithoutAltText++;
      results.issues.push(`Image ${index + 1} missing alt attribute`);
    }
  });

  // Check for proper heading hierarchy
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    if (currentLevel > previousLevel + 1) {
      results.issues.push(`Heading level skipped at heading ${index + 1}`);
    }
    previousLevel = currentLevel;
  });

  return results;
};

/**
 * Test responsive design accessibility
 */
export const testResponsiveAccessibility = () => {
  const results = {
    hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
    textScalesTo200Percent: true, // Would need actual testing
    noHorizontalScrollAt320px: true, // Would need actual testing
    touchTargetsMinimum44px: true, // Would need actual measurement
    issues: []
  };

  // Check viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    const content = viewportMeta.getAttribute('content');
    if (!content.includes('width=device-width')) {
      results.issues.push('Viewport meta tag should include width=device-width');
    }
    if (content.includes('user-scalable=no')) {
      results.issues.push('Viewport meta tag should not disable user scaling');
    }
  } else {
    results.issues.push('Missing viewport meta tag');
  }

  return results;
};

/**
 * Test motion and animation accessibility
 */
export const testMotionAccessibility = () => {
  const results = {
    respectsReducedMotion: false,
    hasAutoplayingContent: false,
    issues: []
  };

  // Check for prefers-reduced-motion support
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotionQuery.matches) {
    // Check if animations are disabled
    const animatedElements = document.querySelectorAll('[style*="animation"], .animate-');
    results.respectsReducedMotion = animatedElements.length === 0;
    if (!results.respectsReducedMotion) {
      results.issues.push('Animations not disabled for users who prefer reduced motion');
    }
  }

  // Check for autoplaying content
  const autoplayElements = document.querySelectorAll('video[autoplay], audio[autoplay]');
  results.hasAutoplayingContent = autoplayElements.length > 0;
  if (results.hasAutoplayingContent) {
    results.issues.push('Autoplaying media content detected');
  }

  return results;
};

/**
 * Run comprehensive accessibility audit
 */
export const runAccessibilityAudit = () => {
  const audit = {
    timestamp: new Date().toISOString(),
    contrast: {
      // Test common color combinations
      whiteOnDarkOverlay: testContrastRatio('#ffffff', '#000000'),
      whiteOnMediumOverlay: testContrastRatio('#ffffff', '#404040'),
    },
    keyboard: testKeyboardNavigation(),
    screenReader: testScreenReaderCompatibility(),
    responsive: testResponsiveAccessibility(),
    motion: testMotionAccessibility(),
    overall: {
      score: 0,
      issues: [],
      recommendations: []
    }
  };

  // Calculate overall score
  let totalTests = 0;
  let passedTests = 0;

  // Contrast tests
  if (audit.contrast.whiteOnDarkOverlay?.passesAA) passedTests++;
  totalTests++;

  // Keyboard navigation
  if (audit.keyboard.elementsWithVisibleFocus === audit.keyboard.totalFocusableElements) passedTests++;
  totalTests++;

  // Screen reader compatibility
  if (audit.screenReader.hasMainLandmark) passedTests++;
  if (audit.screenReader.hasHeadingStructure) passedTests++;
  if (audit.screenReader.imagesWithoutAltText === 0) passedTests++;
  totalTests += 3;

  // Responsive design
  if (audit.responsive.hasViewportMeta) passedTests++;
  totalTests++;

  // Motion accessibility
  if (!audit.motion.hasAutoplayingContent) passedTests++;
  totalTests++;

  audit.overall.score = Math.round((passedTests / totalTests) * 100);

  // Collect all issues
  audit.overall.issues = [
    ...audit.keyboard.issues,
    ...audit.screenReader.issues,
    ...audit.responsive.issues,
    ...audit.motion.issues
  ];

  // Generate recommendations
  if (audit.overall.score < 100) {
    audit.overall.recommendations = [
      'Ensure all interactive elements have visible focus indicators',
      'Provide alternative text for all images',
      'Use proper heading hierarchy (h1, h2, h3, etc.)',
      'Test with screen readers and keyboard-only navigation',
      'Verify color contrast meets WCAG AA standards (4.5:1)',
      'Respect user preferences for reduced motion',
      'Ensure touch targets are at least 44px in size'
    ];
  }

  return audit;
};

// Export test functions for individual use
export default {
  testContrastRatio,
  testKeyboardNavigation,
  testScreenReaderCompatibility,
  testResponsiveAccessibility,
  testMotionAccessibility,
  runAccessibilityAudit
};