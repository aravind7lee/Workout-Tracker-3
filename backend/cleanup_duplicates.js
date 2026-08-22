// One-time cleanup script to delete all duplicate/test workouts from MongoDB
// Run with: node cleanup_duplicates.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI, { family: 4 });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const workoutsCollection = db.collection('workouts');

    // 1. Find all workouts to show current state
    const allWorkouts = await workoutsCollection.find({}).toArray();
    console.log(`\n📊 Total workouts in database: ${allWorkouts.length}`);

    // 2. Show breakdown by title
    const titleCounts = {};
    allWorkouts.forEach(w => {
      const title = w.title || 'Unknown';
      titleCounts[title] = (titleCounts[title] || 0) + 1;
    });
    console.log('\n📋 Workout breakdown by title:');
    Object.entries(titleCounts).forEach(([title, count]) => {
      console.log(`   ${title}: ${count} entries ${count > 1 ? '⚠️ DUPLICATES' : '✅'}`);
    });

    // 3. For each title with duplicates, keep only the first one (oldest) and delete the rest
    let totalDeleted = 0;
    for (const [title, count] of Object.entries(titleCounts)) {
      if (count > 1) {
        // Get all workouts with this title, sorted by creation date
        const duplicates = await workoutsCollection
          .find({ title })
          .sort({ createdAt: 1 })
          .toArray();

        // Keep the first, delete the rest
        const idsToDelete = duplicates.slice(1).map(w => w._id);
        const result = await workoutsCollection.deleteMany({ _id: { $in: idsToDelete } });
        totalDeleted += result.deletedCount;
        console.log(`\n🗑️  Deleted ${result.deletedCount} duplicates of "${title}" (kept 1 original)`);
      }
    }

    if (totalDeleted === 0) {
      console.log('\n✅ No duplicates found!');
    } else {
      console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} duplicate workouts.`);
    }

    // Show final state
    const remaining = await workoutsCollection.countDocuments({});
    console.log(`📊 Remaining workouts: ${remaining}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanup();
