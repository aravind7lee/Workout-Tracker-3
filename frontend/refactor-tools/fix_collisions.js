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
  let basename = path.basename(filePath, '.jsx'); // e.g. Home, Settings, Analytics
  
  if (content.includes(`import {`) && content.includes(`from 'lucide-react'`)) {
    // Check if the component name is exactly imported from lucide-react
    let importRegex = new RegExp(`\\b${basename}\\b(?![\\w])`, 'g');
    
    // Find the import line
    let firstLine = content.split('\n')[0];
    if (firstLine.includes('lucide-react') && importRegex.test(firstLine)) {
      console.log('Collision found in', filePath, 'for', basename);
      
      // Fix import
      firstLine = firstLine.replace(new RegExp(`\\b${basename}\\b(?!\\s+as)`), `${basename} as ${basename}Icon`);
      
      // Fix usages in code like <Home className=...
      let restOfContent = content.substring(content.indexOf('\n'));
      restOfContent = restOfContent.replace(new RegExp(`<${basename} \\b`, 'g'), `<${basename}Icon `);
      // Fix without space e.g. <Home/>
      restOfContent = restOfContent.replace(new RegExp(`<${basename}/>`, 'g'), `<${basename}Icon/>`);
      restOfContent = restOfContent.replace(new RegExp(`<${basename} />`, 'g'), `<${basename}Icon />`);
      
      fs.writeFileSync(filePath, firstLine + restOfContent);
      console.log('Fixed collision for', basename);
    }
  }
});
