import fs from 'fs';
import path from 'path';

const dirsToProcess = [
  path.join(process.cwd(), 'src', 'pages'),
  path.join(process.cwd(), 'src', 'components'),
  path.join(process.cwd(), 'src', 'layouts'),
];

const replacements = [
  // Backgrounds / Slates
  { regex: /slate-950/g, replacement: 'black' },
  { regex: /slate-900/g, replacement: 'black' },
  { regex: /slate-800/g, replacement: 'neutral-900' },
  { regex: /slate-700/g, replacement: 'neutral-800' },
  { regex: /slate-600/g, replacement: 'neutral-700' },
  { regex: /slate-500/g, replacement: 'neutral-500' },
  { regex: /slate-400/g, replacement: 'neutral-400' },
  { regex: /slate-300/g, replacement: 'neutral-300' },
  
  // Cyans to Reds
  { regex: /cyan-200/g, replacement: 'red-300' },
  { regex: /cyan-300/g, replacement: 'red-400' },
  { regex: /cyan-400/g, replacement: 'red-500' },
  { regex: /cyan-500/g, replacement: 'red-600' },
  { regex: /cyan-600/g, replacement: 'red-700' },
  
  // Blues to Reds
  { regex: /blue-400/g, replacement: 'red-500' },
  { regex: /blue-500/g, replacement: 'red-600' },
  { regex: /blue-600/g, replacement: 'red-700' },
  
  // Purples to Dark Reds
  { regex: /purple-400/g, replacement: 'red-600' },
  { regex: /purple-500/g, replacement: 'red-700' },
  { regex: /purple-600/g, replacement: 'red-800' },
  
  // Emerald / Green (if they have them)
  { regex: /emerald-400/g, replacement: 'red-500' },
  { regex: /emerald-500/g, replacement: 'red-600' },
  { regex: /green-400/g, replacement: 'red-500' },
  { regex: /green-500/g, replacement: 'red-600' },
  
  // Neon custom class
  { regex: /text-neon/g, replacement: 'text-red-500' },
  { regex: /bg-neon/g, replacement: 'bg-red-600' },
  { regex: /border-neon/g, replacement: 'border-red-500' },

  // Hex codes directly in JSX
  { regex: /\[#06b6d4\]/ig, replacement: '[#FF0000]' },
  { regex: /\[#00d4ff\]/ig, replacement: '[#FF0000]' },
  { regex: /\[#0f172a\]/ig, replacement: '[#000000]' },
  { regex: /\[#1e293b\]/ig, replacement: '[#0D0D0D]' }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx')) {
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

for (const dir of dirsToProcess) {
  processDirectory(dir);
}
console.log('Done replacing JSX colors.');
