const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to MongoDB");
    
    // Check users
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ email: 'aravind.fyno@gmail.com' }).toArray();
    console.log("Users found:", users.length);
    
    for (const user of users) {
        console.log(`User: ${user._id} | ${user.email} | ${user.name}`);
        const workouts = await db.collection('workouts').find({ user: user._id }).toArray();
        console.log(`  Workouts: ${workouts.length}`);
        
        // Let's also check userId just in case
        const workoutsByUserId = await db.collection('workouts').find({ userId: user._id }).toArray();
        console.log(`  Workouts by userId: ${workoutsByUserId.length}`);
        
        const plans = await db.collection('workoutplans').find({ user: user._id }).toArray();
        console.log(`  Plans (user): ${plans.length}`);
        
        const plansUserId = await db.collection('workoutplans').find({ userId: user._id }).toArray();
        console.log(`  Plans (userId): ${plansUserId.length}`);
    }
    
    // Check total workouts
    const totalWorkouts = await db.collection('workouts').countDocuments();
    console.log("Total workouts in DB:", totalWorkouts);
    
    mongoose.disconnect();
}).catch(err => {
    console.error("Connection error:", err);
});
