import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src'),
  process.cwd() // For tailwind.config.js
];

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
  { regex: /#475569/ig, replacement: '#333333' },

  // Github dark colors
  { regex: /#161b22/ig, replacement: '#000000' },
  { regex: /#21262d/ig, replacement: '#0D0D0D' },
  { regex: /#30363d/ig, replacement: '#1A1A1A' },

  // Green accent from Github (like in Navbar)
  { regex: /#238636/ig, replacement: '#FF0000' },
  
  // Zinc / Amber overrides in Login page that didn't match the new theme
  { regex: /zinc-800/ig, replacement: 'neutral-900' },
  { regex: /amber-950/ig, replacement: 'red-950' },
  { regex: /amber-900/ig, replacement: 'red-900' },
  { regex: /amber-800/ig, replacement: 'red-800' },
  { regex: /amber-700/ig, replacement: 'red-700' },
  { regex: /amber-600/ig, replacement: 'red-600' },
  { regex: /amber-500/ig, replacement: 'red-500' },
  { regex: /amber-400/ig, replacement: 'red-400' },
  { regex: /amber-300/ig, replacement: 'red-300' },
  { regex: /amber-200/ig, replacement: 'red-200' },
  { regex: /amber-100/ig, replacement: 'red-100' },
  { regex: /emerald-950/ig, replacement: 'red-950' },
  { regex: /emerald-800/ig, replacement: 'red-800' },
  { regex: /emerald-300/ig, replacement: 'red-300' }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('dist')) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
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
console.log('Done deep cleaning colors.');
