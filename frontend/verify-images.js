// Image Deployment Verification Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying image deployment configuration...\n');

// Check if all Home images exist in public folder
const publicDir = path.join(__dirname, 'public');
const requiredImages = ['Home1.jpg', 'Home2.jpg', 'Home3.jpg', 'Home4.jpg', 'Home5.jpg'];

let allImagesFound = true;

requiredImages.forEach(image => {
  const imagePath = path.join(publicDir, image);
  if (fs.existsSync(imagePath)) {
    console.log(`✅ ${image} - Found in public folder`);
  } else {
    console.log(`❌ ${image} - Missing from public folder`);
    allImagesFound = false;
  }
});

// Check Home.jsx for correct image paths
const homeJsxPath = path.join(__dirname, 'src', 'pages', 'Home.jsx');
if (fs.existsSync(homeJsxPath)) {
  const homeContent = fs.readFileSync(homeJsxPath, 'utf8');
  
  console.log('\n🔍 Checking Home.jsx image paths...');
  
  requiredImages.forEach(image => {
    const correctPath = `"/${image}"`;
    const incorrectPath = `"/src/assets/${image}"`;
    
    if (homeContent.includes(correctPath)) {
      console.log(`✅ ${image} - Using correct path: ${correctPath}`);
    } else if (homeContent.includes(incorrectPath)) {
      console.log(`❌ ${image} - Using incorrect path: ${incorrectPath}`);
      allImagesFound = false;
    } else {
      console.log(`⚠️  ${image} - Path not found in Home.jsx`);
    }
  });
}

console.log('\n' + '='.repeat(50));
if (allImagesFound) {
  console.log('🎉 SUCCESS: All images are properly configured for deployment!');
  console.log('📦 Images are in public folder and referenced correctly');
  console.log('🚀 Ready for Render deployment');
} else {
  console.log('❌ ISSUES FOUND: Some images need to be fixed');
  console.log('🔧 Please ensure all images are in public folder');
  console.log('🔧 Please ensure all paths use /ImageName.jpg format');
}
console.log('='.repeat(50));