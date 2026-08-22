import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ytSearch from 'yt-search';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'data', 'exerciseVideos.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Find all exercises
const regex = /^\s*"?([\w\-\s]+?)"?\s*:\s*"https:\/\/www\.youtube\.com\/watch\?v=[^"]+",?$/gm;
const matches = [...content.matchAll(regex)];

async function run() {
  console.log(`Found ${matches.length} exercises to update. Please wait...`);
  let count = 0;
  
  for (const match of matches) {
    const oldLine = match[0];
    const exerciseName = match[1].trim();
    
    if (exerciseName.startsWith('//') || !exerciseName) continue;
    
    try {
      const r = await ytSearch(`${exerciseName} exercise form guide short`);
      const video = r.videos.length > 0 ? r.videos[0] : null;
      
      if (video && video.videoId) {
        const newLine = oldLine.replace(/watch\?v=[^"]+/, `watch?v=${video.videoId}`);
        content = content.replace(oldLine, newLine);
        console.log(`\u2714 Updated: ${exerciseName} (${video.videoId})`);
        count++;
      } else {
        console.log(`\u2718 Failed to find video for: ${exerciseName}`);
      }
    } catch (e) {
      console.log(`\u2718 Error on ${exerciseName}: ${e.message}`);
    }
    
    // Tiny delay to be safe
    await new Promise(r => setTimeout(r, 150));
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\n\u2728 Successfully updated ${count} exercise videos!`);
}

run();
