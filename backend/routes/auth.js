import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Real-time user registration to MongoDB Atlas
router.post("/register", async (req, res) => {
  console.log('📝 Registration request received:', { email: req.body.email, name: req.body.name });
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists in MongoDB Atlas
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in MongoDB Atlas with complete tracking
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      registrationDate: new Date(),
      lastLogin: new Date(),
      loginCount: 1,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      isActive: true,
      accountStatus: 'active'
    });

    // Save to MongoDB Atlas
    const savedUser = await user.save();
    
    console.log(`✅ NEW USER REGISTERED IN MONGODB ATLAS:`);
    console.log(`   Name: ${savedUser.name}`);
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   ID: ${savedUser._id}`);
    console.log(`   Database: gym-tracker collection: users`);

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    res.status(201).json({ 
      success: true,
      message: "User registered and saved to MongoDB Atlas successfully",
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        profileImage: savedUser.profileImage || null, // Explicitly ensure profileImage is included
        metrics: savedUser.metrics,
        fitnessGoals: savedUser.fitnessGoals,
        onboardingCompleted: savedUser.onboardingCompleted,
        onboardingCompletedAt: savedUser.onboardingCompletedAt,
        preferences: savedUser.preferences,
        bio: savedUser.bio,
        registrationDate: savedUser.registrationDate,
        createdAt: savedUser.createdAt
      }
    });
    
    console.log(`📸 New User Profile Image: ${savedUser.profileImage ? 'SET' : 'DEFAULT'}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas Registration Error:', error);
    res.status(500).json({ message: "Failed to save user to MongoDB Atlas", error: error.message });
  }
});

// Real-time user login with MongoDB Atlas tracking
router.post("/login", async (req, res) => {
  console.log('🔐 Login request received:', { email: req.body.email });
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user in MongoDB Atlas with profileImage
    const user = await User.findOne({ email: email.toLowerCase() }).select('+profileImage');
    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    console.log(`🔍 Found user: ${user.name} (${user.email}) - ID: ${user._id}`);
    console.log(`🔍 User profileImage: ${user.profileImage ? 'YES' : 'NO'}`);
    console.log(`🔍 User isActive: ${user.isActive}`);
    console.log(`🔍 Password hash exists: ${user.password ? 'YES' : 'NO'}`);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password match result: ${isMatch}`);
    
    if (!isMatch) {
      console.log(`❌ Password mismatch for user: ${user.email}`);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Update login tracking in MongoDB Atlas in real-time
    const updatedUser = await User.findByIdAndUpdate(
      user._id, 
      { 
        lastLogin: new Date(),
        $inc: { loginCount: 1 },
        isActive: true,
        lastLoginIP: req.ip || req.connection.remoteAddress,
        lastUserAgent: req.get('User-Agent')
      },
      { new: true }
    ).select('+profileImage'); // Ensure profileImage is included in response

    console.log(`✅ USER LOGIN TRACKED IN MONGODB ATLAS:`);
    console.log(`   User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`   Login Count: ${updatedUser.loginCount}`);
    console.log(`   Last Login: ${updatedUser.lastLogin}`);
    console.log(`   Database: gym-tracker collection: users`);

    // Generate JWT token
    const token = jwt.sign(
      { id: updatedUser._id, email: updatedUser.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "30d" }
    );

    console.log(`✅ JWT token generated successfully for user: ${updatedUser.email}`);

    res.json({
      success: true,
      message: "Login successful and tracked in MongoDB Atlas",
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage || null,
        metrics: updatedUser.metrics,
        fitnessGoals: updatedUser.fitnessGoals,
        onboardingCompleted: updatedUser.onboardingCompleted,
        onboardingCompletedAt: updatedUser.onboardingCompletedAt,
        preferences: updatedUser.preferences,
        bio: updatedUser.bio,
        stats: updatedUser.stats,
        lastLogin: updatedUser.lastLogin,
        loginCount: updatedUser.loginCount,
        createdAt: updatedUser.createdAt
      }
    });
    
    console.log(`📸 Profile Image Status: ${updatedUser.profileImage ? 'PRESENT - Will sync across devices' : 'NONE - Default will be used'}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas Login Error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: "Login failed. Please try again.", error: error.message });
  }
});

export default router;
