const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const emojiRegex = require('emoji-regex');

// Emoji to Lucide Icon mapping
const emojiMap = {
  '👤': 'User', '✍️': 'Edit3', '👍': 'ThumbsUp', '👨': 'User', '💼': 'Briefcase', '👩': 'User', '🦰': 'User',
  '🎓': 'GraduationCap', '🛡️': 'Shield', '🔍': 'Search', '✅': 'CheckCircle2', '❌': 'XCircle', '🔒': 'Lock',
  '🏋️': 'Dumbbell', '📊': 'BarChart3', '🍽️': 'Utensils', '📋': 'ClipboardList', '🏆': 'Trophy', '☁️': 'Cloud',
  '📈': 'TrendingUp', '🔑': 'Key', '🚀': 'Rocket', '⚠️': 'AlertTriangle', '🎯': 'Target', '🔄': 'RefreshCw',
  '🗑️': 'Trash2', '💪': 'BicepsFlexed', '🥩': 'Beef', '🌱': 'Sprout', '🥛': 'Milk', '🥦': 'Leaf', '🍎': 'Apple',
  '🥜': 'Nut', '🍫': 'Candy', '🥤': 'CupSoda', '🍚': 'Bowl', '⚙️': 'Settings', '📞': 'Phone', '💬': 'MessageCircle',
  '❓': 'HelpCircle', '📄': 'FileText', '📷': 'Camera', '🥚': 'Egg', '🍗': 'Drumstick', '🍌': 'Banana',
  '🥣': 'Soup', '🐟': 'Fish', '⚡': 'Zap', '💡': 'Lightbulb', '🌟': 'Star', '🌙': 'Moon', '⚖️': 'Scale',
  '🥗': 'Salad', '🌅': 'Sunrise', '⏰': 'Clock', '💧': 'Droplet', '🧠': 'Brain', '📅': 'Calendar', '⏳': 'Hourglass',
  '🥑': 'Nut', '🥕': 'Carrot', '🫐': 'Grape', '🍊': 'Citrus', '🥬': 'Leaf', '🍇': 'Grape', '☀️': 'Sun',
  '🍿': 'Popcorn', '🧬': 'Dna', '⚗️': 'FlaskConical', '📤': 'Upload', '🐦': 'Twitter', '✏️': 'Pencil',
  '🎉': 'PartyPopper', '⭐': 'Star', '▶️': 'Play', '⏹️': 'Square', '🟢': 'Circle', '🟡': 'Circle', '🔴': 'Circle',
  '📱': 'Smartphone', '📝': 'Edit', '🔓': 'Unlock', '🧹': 'Eraser', '⏱️': 'Timer', '🏃': 'Activity',
  '🩹': 'Bandage', '📧': 'Mail', '💥': 'Bomb', '🦵': 'Activity', '💾': 'Save', '🌐': 'Globe', '📚': 'Book',
  '😴': 'Moon', '⚪': 'Circle', '🏅': 'Medal', '🔗': 'Link', '👋': 'Hand', '💯': 'CheckCircle2', '❤️': 'Heart',
  '🤍': 'Heart', '🌍': 'Globe', '🟠': 'Circle', '🔵': 'Circle', '🟣': 'Circle', '💆': 'User', '🏷️': 'Tag',
  '💨': 'Wind', '🎥': 'Video', '👁️': 'Eye', '➕': 'Plus', '🧘': 'Activity', '🤸': 'Activity', '🔐': 'LockKeyhole',
  '♂️': 'User', '✨': 'Sparkles', '🖱️': 'MousePointer', '🚪': 'DoorOpen', '🖼️': 'Image', '📉': 'TrendingDown',
  '🏠': 'Home', '⬆️': 'ArrowUp', '🔔': 'Bell', '🔌': 'Plug', '🪑': 'Armchair', '🚶': 'Footprints', '🎨': 'Palette',
  '🇺🇸': 'Flag', '🇪🇸': 'Flag', '🇫🇷': 'Flag', '🇩🇪': 'Flag', '🎛️': 'Sliders', '📡': 'Antenna', '⏸️': 'Pause',
  '😊': 'Smile', '😤': 'Angry', '😓': 'Frown', '➡️': 'ArrowRight', '🛌': 'Bed', 'ℹ️': 'Info', '🏋️‍♂️': 'Dumbbell', '👨‍💼': 'User', '👩‍🦰': 'User', '👨‍🎓': 'GraduationCap', '👩‍💻': 'Laptop', '⏱': 'Timer'
};

const regex = emojiRegex();

// Helper to fallback if missing
function getIconName(emoji) {
  // Try exact match
  if (emojiMap[emoji]) return emojiMap[emoji];
  // Remove zero-width joiners and variation selectors and try again
  const cleanEmoji = emoji.replace(/[\uFE0F\u200D]/g, '');
  if (emojiMap[cleanEmoji]) return emojiMap[cleanEmoji];
  // Fallback to Star
  return 'Star';
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (dirPath.includes('node_modules')) return;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const files = [];
walkDir('d:/Workout-Tracker-3/frontend/src', function(filePath) {
  if (filePath.endsWith('.jsx')) files.push(filePath);
});

files.forEach(async filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasEmoji = false;
  
  // Quick check
  regex.lastIndex = 0;
  if (!regex.test(content)) return;

  console.log(`Processing ${filePath}...`);
  let iconsUsed = new Set();

  try {
    const result = babel.transformSync(content, {
      filename: filePath,
      presets: ['@babel/preset-react'],
      plugins: [
        function ({ types: t }) {
          return {
            visitor: {
              StringLiteral(path) {
                // If the string contains emojis, we replace the string literal with a JSX fragment if it's an attribute
                // Or if it's in an object property, we replace it with a JSX Element
                let val = path.node.value;
                regex.lastIndex = 0;
                if (!regex.test(val)) return;

                // Create array of text and JSX Elements
                let nodes = [];
                let lastIndex = 0;
                let match;
                regex.lastIndex = 0;
                while ((match = regex.exec(val)) !== null) {
                  if (match.index > lastIndex) {
                    nodes.push(t.stringLiteral(val.substring(lastIndex, match.index)));
                  }
                  const iconName = getIconName(match[0]);
                  iconsUsed.add(iconName);
                  const iconElement = t.jsxElement(
                    t.jsxOpeningElement(t.jsxIdentifier(iconName), [
                      t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('w-[1em] h-[1em] inline-block'))
                    ], true),
                    null,
                    [],
                    true
                  );
                  nodes.push(iconElement);
                  lastIndex = regex.lastIndex;
                }
                if (lastIndex < val.length) {
                  nodes.push(t.stringLiteral(val.substring(lastIndex)));
                }

                // If it's a JSXAttribute (e.g. placeholder="🔥") we shouldn't replace it with an element easily, 
                // but let's assume it's safe to replace with JSXExpressionContainer for attributes
                if (path.parentPath.isJSXAttribute()) {
                  if (nodes.length === 1 && t.isJSXElement(nodes[0])) {
                    path.replaceWith(t.jsxExpressionContainer(nodes[0]));
                  } else {
                    // wrap in fragment
                    const frag = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), nodes.map(n => t.isStringLiteral(n) ? t.jsxText(n.value) : n));
                    path.replaceWith(t.jsxExpressionContainer(frag));
                  }
                  hasEmoji = true;
                } else if (path.parentPath.isObjectProperty() || path.parentPath.isArrayExpression() || path.parentPath.isVariableDeclarator()) {
                  if (nodes.length === 1 && t.isJSXElement(nodes[0])) {
                    path.replaceWith(nodes[0]);
                  } else {
                    const frag = t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), nodes.map(n => t.isStringLiteral(n) ? t.jsxText(n.value) : n));
                    path.replaceWith(frag);
                  }
                  hasEmoji = true;
                }
              },
              JSXText(path) {
                let val = path.node.value;
                regex.lastIndex = 0;
                if (!regex.test(val)) return;

                let nodes = [];
                let lastIndex = 0;
                let match;
                regex.lastIndex = 0;
                while ((match = regex.exec(val)) !== null) {
                  if (match.index > lastIndex) {
                    nodes.push(t.jsxText(val.substring(lastIndex, match.index)));
                  }
                  const iconName = getIconName(match[0]);
                  iconsUsed.add(iconName);
                  nodes.push(t.jsxElement(
                    t.jsxOpeningElement(t.jsxIdentifier(iconName), [
                      t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('w-[1em] h-[1em] inline-block'))
                    ], true),
                    null,
                    [],
                    true
                  ));
                  lastIndex = regex.lastIndex;
                }
                if (lastIndex < val.length) {
                  nodes.push(t.jsxText(val.substring(lastIndex)));
                }
                path.replaceWithMultiple(nodes);
                hasEmoji = true;
              }
            }
          };
        }
      ],
      ast: false,
    });

    if (hasEmoji && iconsUsed.size > 0 && result && result.code) {
      let newCode = result.code;
      
      const importStmt = `import { ${Array.from(iconsUsed).join(', ')} } from 'lucide-react';\n`;
      // Find the last import
      let lines = newCode.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIdx = i;
        }
      }
      if (lastImportIdx !== -1) {
        lines.splice(lastImportIdx + 1, 0, importStmt);
      } else {
        lines.unshift(importStmt);
      }
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Updated ${filePath}`);
    }
  } catch (err) {
    console.error(`Error transforming ${filePath}: ${err.message}`);
  }
});
