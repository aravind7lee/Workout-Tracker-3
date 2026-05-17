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

const replacements = [
  // Nutrition.jsx
  { from: '<div class="text-xl">🍽️</div>', to: '<div className="text-xl"><Utensils className="w-[1em] h-[1em] inline-block" /></div>' },
  { from: '<div class="text-xl">❌</div>', to: '<div className="text-xl"><X className="w-[1em] h-[1em] inline-block" /></div>' },
  
  // NutritionAnalytics.jsx
  { from: 'analytics.trends.improving ? "📈" : "📊"', to: 'analytics.trends.improving ? <TrendingUp className="w-[1em] h-[1em] inline-block"/> : <BarChart3 className="w-[1em] h-[1em] inline-block"/>' },
  { from: 'analytics.trends.consistent ? "🎯" : "📊"', to: 'analytics.trends.consistent ? <Target className="w-[1em] h-[1em] inline-block"/> : <BarChart3 className="w-[1em] h-[1em] inline-block"/>' },
  
  // Settings.jsx
  { from: 'settings.fitnessGoals.goal === "lose"\n                ? "🔥"\n                : settings.fitnessGoals.goal === "gain"\n                  ? "📈"\n                  : settings.fitnessGoals.goal === "muscle"\n                    ? "💪"\n                    : settings.fitnessGoals.goal === "strength"\n                      ? "⚡"\n                      : "⚖️"', 
    to: 'settings.fitnessGoals.goal === "lose" ? <Flame className="w-[1em] h-[1em] inline-block"/> : settings.fitnessGoals.goal === "gain" ? <TrendingUp className="w-[1em] h-[1em] inline-block"/> : settings.fitnessGoals.goal === "muscle" ? <BicepsFlexed className="w-[1em] h-[1em] inline-block"/> : settings.fitnessGoals.goal === "strength" ? <Zap className="w-[1em] h-[1em] inline-block"/> : <Scale className="w-[1em] h-[1em] inline-block"/>' },
  { from: 'enabled ? "✅" : "❌"', to: 'enabled ? <CheckCircle2 className="w-[1em] h-[1em] inline-block"/> : <XCircle className="w-[1em] h-[1em] inline-block"/>' },
  { from: 'isOnline ? "✅ Connected" : "❌ Offline"', to: 'isOnline ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block"/> Connected</> : <><XCircle className="w-[1em] h-[1em] inline-block"/> Offline</>' },
  { from: 'isSaving ? "🔄 SYNCING TO MONGODB..." : "💾 SAVE TO CLOUD"', to: 'isSaving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SYNCING TO MONGODB...</> : <><Save className="w-[1em] h-[1em] inline-block"/> SAVE TO CLOUD</>' },

  // YourWorkoutSplits.jsx & WorkoutSplits.jsx
  { from: 'isRestDay ? "😴 Rest" : "💪 Workout"', to: 'isRestDay ? <><Moon className="w-[1em] h-[1em] inline-block"/> Rest</> : <><Dumbbell className="w-[1em] h-[1em] inline-block"/> Workout</>' },
  
  // StartWorkout.jsx
  { from: 'isOnline ? "🔥 LIVE SYNC" : "⚡ OFFLINE"', to: 'isOnline ? <><Flame className="w-[1em] h-[1em] inline-block"/> LIVE SYNC</> : <><Zap className="w-[1em] h-[1em] inline-block"/> OFFLINE</>' },
  { from: 'isPaused ? "▶️ Resume Workout" : "⏸️ Pause Workout"', to: 'isPaused ? <><Play className="w-[1em] h-[1em] inline-block"/> Resume Workout</> : <><Pause className="w-[1em] h-[1em] inline-block"/> Pause Workout</>' },
  { from: 'isPaused ? "⏸️ Paused" : formatTime(restTimer)', to: 'isPaused ? <><Pause className="w-[1em] h-[1em] inline-block"/> Paused</> : formatTime(restTimer)' },
  { from: 'workoutData.sets.length === workoutData.targetSets - 1\n                  ? "➡️ Next Exercise"\n                  : "🏆 Finish Workout"', to: 'workoutData.sets.length === workoutData.targetSets - 1 ? <><ArrowRight className="w-[1em] h-[1em] inline-block"/> Next Exercise</> : <><Trophy className="w-[1em] h-[1em] inline-block"/> Finish Workout</>' },

  // Profile.jsx / ProfileEnhanced.jsx / ProfileAdvanced.jsx
  { from: 'isOnline ? "🔥 LIVE SYNC ACTIVE" : "⚡ OFFLINE MODE"', to: 'isOnline ? <><Flame className="w-[1em] h-[1em] inline-block"/> LIVE SYNC ACTIVE</> : <><Zap className="w-[1em] h-[1em] inline-block"/> OFFLINE MODE</>' },
  { from: 'loading ? "🔄 SYNCING..." : "🔄 REFRESH"', to: 'loading ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SYNCING...</> : <><RefreshCw className="w-[1em] h-[1em] inline-block"/> REFRESH</>' },
  { from: 'saving ? "🔄 SAVING..." : "💾 SAVE CHANGES"', to: 'saving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SAVING...</> : <><Save className="w-[1em] h-[1em] inline-block"/> SAVE CHANGES</>' },
  { from: 'saving ? "🔄 SAVING..." : "💾 SAVE"', to: 'saving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> SAVING...</> : <><Save className="w-[1em] h-[1em] inline-block"/> SAVE</>' },
  { from: 'saving ? "Saving..." : "💾 Save Changes"', to: 'saving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> Saving...</> : <><Save className="w-[1em] h-[1em] inline-block"/> Save Changes</>' },

  // PlansBuilder
  { from: 'autoSave ? "🔄" : "💾"', to: 'autoSave ? <RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> : <Save className="w-[1em] h-[1em] inline-block"/>' },
  { from: 'saving ? "🔄" : "💾"', to: 'saving ? <RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> : <Save className="w-[1em] h-[1em] inline-block"/>' },
  { from: 'saving ? "🔄 Saving..." : "💾 Save Plan"', to: 'saving ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> Saving...</> : <><Save className="w-[1em] h-[1em] inline-block"/> Save Plan</>' },
  { from: 'autoSave ? "🔄 Auto-Save ON" : "💾 Auto-Save OFF"', to: 'autoSave ? <><RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> Auto-Save ON</> : <><Save className="w-[1em] h-[1em] inline-block"/> Auto-Save OFF</>' },

  // AuthDebugger
  { from: 'token ? "✅ Present" : "❌ Missing"', to: 'token ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block text-green-500"/> Present</> : <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>' },
  { from: 'user ? "✅ Present" : "❌ Missing"', to: 'user ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block text-green-500"/> Present</> : <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>' },
  { from: 'user?.id || user?._id || "❌ Missing"', to: 'user?.id || user?._id || <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>' },
  { from: 'user?.name || "❌ Missing"', to: 'user?.name || <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>' },
  { from: 'user?.email || "❌ Missing"', to: 'user?.email || <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> Missing</>' },
  { from: 'isAuthenticated() ? "✅ Yes" : "❌ No"', to: 'isAuthenticated() ? <><CheckCircle2 className="w-[1em] h-[1em] inline-block text-green-500"/> Yes</> : <><XCircle className="w-[1em] h-[1em] inline-block text-red-500"/> No</>' },

  // RealTimeStatus / SyncStatus
  { from: 'syncStatus === "syncing" ? "🔄" : "🔄"', to: 'syncStatus === "syncing" ? <RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> : <RefreshCw className="w-[1em] h-[1em] inline-block"/>' },
];

let changedFiles = 0;
walkDir('d:/Workout-Tracker-3/frontend/src', function(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(r => {
    // Escape string for regex if needed, but simple split/join works for exact matching
    content = content.split(r.from).join(r.to);
  });
  
  // Custom Regex Replacements for dynamic ones
  content = content.replace(/\? "➡️ Next Exercise"\n\s*: "🏆 Finish Workout"/g, '? <><ArrowRight className="w-[1em] h-[1em] inline-block"/> Next Exercise</> : <><Trophy className="w-[1em] h-[1em] inline-block"/> Finish Workout</>');
  content = content.replace(/\? "⏸️ Resume to Finish"\n\s*: \`✅ Finish Set \$\{/g, '? <><Play className="w-[1em] h-[1em] inline-block"/> Resume to Finish</> : <><CheckCircle2 className="w-[1em] h-[1em] inline-block"/> Finish Set ${');
  content = content.replace(/\? \`➡️ Next Exercise \(/g, '? <><ArrowRight className="w-[1em] h-[1em] inline-block"/> Next Exercise (');
  content = content.replace(/: \`✅ Finish Workout \(/g, ': <><CheckCircle2 className="w-[1em] h-[1em] inline-block"/> Finish Workout (');

  content = content.replace(/user \? "💪" : "🔒"/g, 'user ? <BicepsFlexed className="w-[1em] h-[1em] inline-block"/> : <Lock className="w-[1em] h-[1em] inline-block"/>');

  if (content !== originalContent) {
    // Add missing imports automatically
    const iconsNeeded = ['Utensils', 'X', 'TrendingUp', 'BarChart3', 'Target', 'Flame', 'BicepsFlexed', 'Zap', 'Scale', 'CheckCircle2', 'XCircle', 'RefreshCw', 'Save', 'Moon', 'Dumbbell', 'Play', 'Pause', 'ArrowRight', 'Trophy', 'Lock'];
    let importsToAdd = [];
    iconsNeeded.forEach(icon => {
      if (content.includes(`<${icon}`) || content.includes(` ${icon} `) || content.includes(`${icon},`)) {
        if (!content.includes(icon) || !content.match(new RegExp(`import\\s+.*\\b${icon}\\b.*from\\s+['"]lucide-react['"]`))) {
          importsToAdd.push(icon);
        }
      }
    });

    if (importsToAdd.length > 0) {
       // Just find lucide-react import and add them
       const lucideMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
       if (lucideMatch) {
         let existing = lucideMatch[1];
         let newIcons = importsToAdd.filter(i => !existing.includes(i));
         if (newIcons.length > 0) {
           content = content.replace(lucideMatch[0], `import { ${existing.trim()}, ${newIcons.join(', ')} } from 'lucide-react'`);
         }
       } else {
         content = `import { ${importsToAdd.join(', ')} } from 'lucide-react';\n` + content;
       }
    }

    fs.writeFileSync(filePath, content);
    console.log('Fixed UI emojis in', filePath);
    changedFiles++;
  }
});
console.log(`Updated ${changedFiles} files with custom UI emoji replacements.`);
