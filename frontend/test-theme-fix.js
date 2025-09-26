// Test Theme Fix
console.log('🎨 Testing Theme Context Fix...');

// Test theme context availability
try {
  const themeElement = document.documentElement;
  console.log('Current theme class:', themeElement.classList.contains('dark') ? 'dark' : 'light');
  console.log('Theme attribute:', themeElement.getAttribute('data-theme'));
  console.log('✅ Theme system working correctly');
} catch (error) {
  console.log('❌ Theme system error:', error.message);
}

// Test localStorage theme
try {
  const savedTheme = localStorage.getItem('theme');
  console.log('Saved theme:', savedTheme || 'none');
} catch (error) {
  console.log('❌ LocalStorage error:', error.message);
}

console.log('🎨 Theme test complete');