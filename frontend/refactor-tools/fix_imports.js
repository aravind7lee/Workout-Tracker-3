const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (dirPath.includes('node_modules')) return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('d:/Workout-Tracker-3/frontend/src', function(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let imports = new Set();
  
  // Find all lucide-react imports
  const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g;
  let hasLucide = false;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    hasLucide = true;
    match[1].split(',').forEach(i => {
      const name = i.trim();
      if (name) imports.add(name);
    });
  }

  if (hasLucide) {
    // Remove all existing lucide-react imports
    content = content.replace(importRegex, '');
    
    // Add single import at the top
    const newImport = `import { ${Array.from(imports).join(', ')} } from 'lucide-react';\n`;
    
    // Find the first import
    let lines = content.split('\n');
    let firstImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        firstImportIdx = i;
        break;
      }
    }
    
    if (firstImportIdx !== -1) {
      lines.splice(firstImportIdx, 0, newImport.trim());
    } else {
      lines.unshift(newImport.trim());
    }
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Fixed imports in', filePath);
  }
});
