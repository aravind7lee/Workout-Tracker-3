// Light Mode Test Utility
// This utility helps verify that light mode text is visible

export const testLightModeVisibility = () => {
  const body = document.body;
  const isLightMode = body.classList.contains('light-theme') || 
                     document.documentElement.getAttribute('data-theme') === 'light';
  
  if (!isLightMode) {
    console.log('✅ Currently in dark mode - no issues expected');
    return;
  }
  
  console.log('🔍 Testing light mode text visibility...');
  
  // Test for problematic text colors
  const problematicSelectors = [
    '.text-white:not(.preserve-color)',
    '.text-slate-300:not(.preserve-color)', 
    '.text-slate-400:not(.preserve-color)',
    '.text-gray-300:not(.preserve-color)',
    '.text-gray-400:not(.preserve-color)'
  ];
  
  let issuesFound = 0;
  
  problematicSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.warn(`⚠️ Found ${elements.length} elements with potentially invisible text: ${selector}`);
      elements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const color = computedStyle.color;
        console.log(`   - Element color: ${color}`, el);
      });
      issuesFound += elements.length;
    }
  });
  
  // Test background colors
  const backgroundElements = document.querySelectorAll('.bg-slate-800, .bg-slate-900');
  if (backgroundElements.length > 0) {
    console.warn(`⚠️ Found ${backgroundElements.length} elements with dark backgrounds that may need light mode overrides`);
  }
  
  if (issuesFound === 0) {
    console.log('✅ No text visibility issues found in light mode!');
  } else {
    console.log(`❌ Found ${issuesFound} potential text visibility issues`);
  }
  
  // Test theme variables
  const rootStyles = window.getComputedStyle(document.documentElement);
  const textColor = rootStyles.getPropertyValue('--text').trim();
  const headingColor = rootStyles.getPropertyValue('--heading').trim();
  const bgColor = rootStyles.getPropertyValue('--bg').trim();
  
  console.log('🎨 Current theme variables:');
  console.log(`   --text: ${textColor}`);
  console.log(`   --heading: ${headingColor}`);
  console.log(`   --bg: ${bgColor}`);
  
  return {
    isLightMode,
    issuesFound,
    themeVariables: { textColor, headingColor, bgColor }
  };
};

// Auto-run test when in development
if (process.env.NODE_ENV === 'development') {
  // Run test after DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(testLightModeVisibility, 1000);
    });
  } else {
    setTimeout(testLightModeVisibility, 1000);
  }
}