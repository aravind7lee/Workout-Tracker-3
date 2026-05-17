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
let results = [];
walkDir('d:/Workout-Tracker-3/frontend/src', function(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    let match;
    const lineRegex = emojiRegex();
    if (lineRegex.test(line)) {
      if (line.includes('console.') || line.includes('alert(') || line.includes('setMessage(')) return;
      results.push({
        file: filePath.replace(/\\/g, '/'),
        lineNum: i + 1,
        line: line.trim()
      });
    }
  });
});

fs.writeFileSync('d:/Workout-Tracker-3/frontend/refactor-tools/emoji_report.json', JSON.stringify(results, null, 2));
