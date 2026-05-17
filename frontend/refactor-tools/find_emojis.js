const fs = require('fs');
const path = require('path');
const emojiRegex = require('emoji-regex');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (dirPath.includes('node_modules')) return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const regex = emojiRegex();
let found = 0;
walkDir('d:/Workout-Tracker-3/frontend/src', function(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    let match;
    const lineRegex = emojiRegex();
    while ((match = lineRegex.exec(line)) !== null) {
      if (line.includes('console.log') || line.includes('alert') || line.includes('console.warn') || line.includes('console.error')) {
         continue; // Ignore logs and alerts for now
      }
      // Ignore some literal strings that just have emoji but shouldn't be rendered directly as UI
      // Let's print all of them to be safe
      console.log(`${filePath}:${i+1} - ${match[0]} ${line.trim()}`);
      found++;
    }
  });
});
console.log('Total emojis found:', found);
