// Test Error Suppression Script
// Run this to verify all error types are properly suppressed

console.log('🧪 Testing Error Suppression...');

// Test 1: Chrome Extension Errors
console.log('Testing Chrome extension errors...');
console.error('chrome-extension://test-error');
console.error('fetchIt @ contentScript.bundle.js:355572');
console.error('Extension context invalidated');

// Test 2: React Warnings
console.log('Testing React warnings...');
console.warn('Warning: React does not recognize the `fetchPriority` prop on a DOM element');
console.warn('Warning: validateDOMNesting');

// Test 3: JSON Parsing Errors
console.log('Testing JSON parsing errors...');
console.error('Failed to load MongoDB data: SyntaxError: Failed to execute \'json\' on \'Response\': Unexpected token \'<\', \"<!doctype \"... is not valid JSON');

// Test 4: Network Errors
console.log('Testing network errors...');
console.error('Failed to fetch');
console.error('NetworkError');

// Test 5: API Errors
console.log('Testing API errors...');
console.error('404 (Not Found)');
console.error('api/users/streak error');

console.log('✅ Error suppression test complete. If you see this message and no errors above, suppression is working correctly!');

// Test fetch error handling
async function testFetchErrorHandling() {
  console.log('Testing fetch error handling...');
  
  try {
    const response = await fetch('/api/nonexistent-endpoint');
    const data = await response.json();
    console.log('Fetch test result:', data);
  } catch (error) {
    console.log('Fetch error handled gracefully:', error.message);
  }
}

testFetchErrorHandling();