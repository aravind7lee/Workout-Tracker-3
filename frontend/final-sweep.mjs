import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src')
];

const replacements = [
  // Sky / Light Blue -> Red
  { regex: /sky-300/ig, replacement: 'red-400' },
  { regex: /sky-400/ig, replacement: 'red-500' },
  { regex: /sky-500/ig, replacement: 'red-600' },
  { regex: /sky-600/ig, replacement: 'red-700' },
  { regex: /sky-800/ig, replacement: 'red-900' },
  { regex: /sky-900/ig, replacement: 'black' },
  { regex: /#0284c7/ig, replacement: '#FF0000' },
  { regex: /#0369a1/ig, replacement: '#E60000' },
  { regex: /#38bdf8/ig, replacement: '#FF0000' },
  { regex: /#0ea5e9/ig, replacement: '#FF0000' },

  // Teal / Cyan-Green -> Orange/Amber (for contrast) or Red
  { regex: /teal-300/ig, replacement: 'red-400' },
  { regex: /teal-400/ig, replacement: 'red-500' },
  { regex: /teal-500/ig, replacement: 'red-600' },
  { regex: /teal-600/ig, replacement: 'red-700' },
  { regex: /#2dd4bf/ig, replacement: '#FF0000' },
  { regex: /#14b8a6/ig, replacement: '#E60000' },
  { regex: /#0d9488/ig, replacement: '#8B0000' },

  // Indigo / Purple-Blue -> Dark Red
  { regex: /indigo-300/ig, replacement: 'red-500' },
  { regex: /indigo-400/ig, replacement: 'red-600' },
  { regex: /indigo-500/ig, replacement: 'red-700' },
  { regex: /indigo-600/ig, replacement: 'red-800' },
  { regex: /indigo-800/ig, replacement: 'red-950' },
  { regex: /indigo-900/ig, replacement: 'black' },
  { regex: /#818cf8/ig, replacement: '#FF0000' },
  { regex: /#6366f1/ig, replacement: '#E60000' },
  { regex: /#4f46e5/ig, replacement: '#8B0000' },
  
  // Also clean up any lingering fuchsia
  { regex: /fuchsia-400/ig, replacement: 'red-500' },
  { regex: /fuchsia-500/ig, replacement: 'red-600' }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('dist')) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
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
console.log('Done finalizing cool colors to warm colors.');
