// Theme Context Test - Run this in browser console to verify theme context is working
console.log('🎨 Testing Theme Context...');

try {
  // Test if ThemeContext module can be imported
  import('../context/ThemeContext.jsx').then(module => {
    console.log('✅ ThemeContext module loaded successfully');
    console.log('Available exports:', Object.keys(module));
    
    if (module.useTheme) {
      console.log('✅ useTheme hook is available');
    } else {
      console.error('❌ useTheme hook not found in exports');
    }
    
    if (module.ThemeProvider) {
      console.log('✅ ThemeProvider component is available');
    } else {
      console.error('❌ ThemeProvider component not found in exports');
    }
  }).catch(error => {
    console.error('❌ Failed to load ThemeContext module:', error);
  });
} catch (error) {
  console.error('❌ Theme context test failed:', error);
}

// Test theme application
console.log('Current theme class on html:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
console.log('Current data-theme attribute:', document.documentElement.getAttribute('data-theme'));
console.log('Current body class:', document.body.className);

export default function testTheme() {
  console.log('Theme test function executed');
}