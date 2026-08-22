import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ytSearch from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'data', 'exerciseVideos.js');
let content = fs.readFileSync(filePath, 'utf-8');

const failedExercises = [
  "Decline Bench Press",
  "Weighted Dips",
  "Incline Cable Fly",
  "Decline Dumbbell Press",
  "Wide-Grip Push-ups",
  "Front Raises",
  "Rear Delt Fly",
  "Upright Rows",
  "Cable Lateral Raises",
  "Handstand Push-ups",
  "Single-Arm Lateral Raise",
  "Reverse Fly",
  "21s Bicep Curls",
  "Overhead Cable Extension",
  "Plank to Push-up"
];

async function run() {
  console.log(`Fixing ${failedExercises.length} failed exercises...`);
  
  for (const exerciseName of failedExercises) {
    try {
      // Trying a different, broader search query
      const r = await ytSearch(`${exerciseName} exercise form tutorial`);
      const video = r.videos.length > 0 ? r.videos[0] : null;
      
      if (video && video.videoId) {
        // Find the line for this exercise
        const regex = new RegExp(`^\\s*"?${exerciseName}"?\\s*:\\s*"https:\\/\\/www\\.youtube\\.com\\/watch\\?v=[^"]+",?$`, 'm');
        const match = content.match(regex);
        
        if (match) {
          const oldLine = match[0];
          const newLine = oldLine.replace(/watch\?v=[^"]+/, `watch?v=${video.videoId}`);
          content = content.replace(oldLine, newLine);
          console.log(`\u2714 Fixed: ${exerciseName} (${video.videoId})`);
        } else {
          console.log(`\u2718 Could not find ${exerciseName} in exerciseVideos.js`);
        }
      } else {
        console.log(`\u2718 Still failed to find video for: ${exerciseName}`);
      }
    } catch (e) {
      console.log(`\u2718 Error on ${exerciseName}: ${e.message}`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\n\u2728 Finished fixing failed videos!`);
}

run();
