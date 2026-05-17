import fs from 'fs';
import path from 'path';

const stylesDir = path.join(process.cwd(), 'src', 'styles');

const replacements = [
  // Cyan & Neon
  { regex: /#06b6d4/ig, replacement: '#FF0000' },
  { regex: /#00d4ff/ig, replacement: '#FF0000' },
  { regex: /#0ea5e9/ig, replacement: '#E60000' },
  { regex: /#0891b2/ig, replacement: '#8B0000' },
  { regex: /#8b5cf6/ig, replacement: '#8B0000' }, 
  { regex: /rgba\(\s*0\s*,\s*212\s*,\s*255/ig, replacement: 'rgba(255, 0, 0' },
  { regex: /rgba\(\s*6\s*,\s*182\s*,\s*212/ig, replacement: 'rgba(255, 0, 0' },
  
  // Blue
  { regex: /#1d4ed8/ig, replacement: '#FF0000' },
  { regex: /#1e40af/ig, replacement: '#E60000' },
  
  // Deep Slate backgrounds
  { regex: /#0f172a/ig, replacement: '#000000' },
  { regex: /#1e293b/ig, replacement: '#0D0D0D' },
  { regex: /#334155/ig, replacement: '#1A1A1A' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const {regex, replacement} of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
}

processDirectory(stylesDir);
console.log('Done replacing colors.');
