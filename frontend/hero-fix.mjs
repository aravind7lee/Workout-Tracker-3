import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src', 'styles'),
  path.join(process.cwd(), 'src', 'pages')
];

const replacements = [
  // Hero Button Bright Blue
  { regex: /#2563EB/ig, replacement: '#FF0000' },
  // Hero Accent Green
  { regex: /#4ADE80/ig, replacement: '#FF0000' },
  // Hero Teal "X" in GRINDX
  { regex: /#4DB6AC/ig, replacement: '#8B0000' },
  // Hero Cyan
  { regex: /#22d3ee/ig, replacement: '#FF0000' },
  // Hero Purple Gradients
  { regex: /#7c3aed/ig, replacement: '#8B0000' },
  { regex: /#6d28d9/ig, replacement: '#000000' },
  // Light Mode Greens
  { regex: /#16A34A/ig, replacement: '#FF0000' }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('dist')) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let originalContent = fs.readFileSync(fullPath, 'utf8');
      let content = originalContent;
      
      for (const {regex, replacement} of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

for (const dir of dirsToProcess) {
  processDirectory(dir);
}
console.log('Done fixing hero hex codes.');
