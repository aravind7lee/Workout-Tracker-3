# MongoDB Setup Guide for Workout Tracker

## 🚀 Quick Setup (Recommended): MongoDB Atlas Cloud

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up for free account
3. Create new project: "Workout Tracker"

### Step 2: Create Database Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (FREE)
3. Select region closest to you
4. Name cluster: "Cluster0"
5. Click "Create Cluster"

### Step 3: Setup Database Access
1. Go to "Database Access" → "Add New Database User"
2. Username: `workouttracker`
3. Password: `workoutpass123`
4. Database User Privileges: "Read and write to any database"
5. Click "Add User"

### Step 4: Setup Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with `workoutpass123`

### Step 6: Update Backend Configuration
Update `backend/.env` file:
```
MONGO_URI=mongodb+srv://workouttracker:workoutpass123@cluster0.xxxxx.mongodb.net/gym-tracker?retryWrites=true&w=majority
```

---

## 💻 Alternative: Local MongoDB Installation

### Windows Installation
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Run installer with default settings
3. Install as Windows Service
4. Run: `setup-mongodb.bat`

### Manual Start (if service fails)
```bash
# Create data directory
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

---

## ✅ Verify Setup

### Test Connection
```bash
cd backend
npm start
```

### Expected Output
```
✅ MongoDB connected successfully
📊 Database: mongodb+srv://...
🚀 Server running on port 5000
```

---

## 🔧 Troubleshooting

### Connection Timeout
- Check internet connection
- Verify MongoDB Atlas IP whitelist
- Confirm username/password

### Local MongoDB Issues
- Ensure MongoDB service is running: `net start MongoDB`
- Check if port 27017 is available
- Verify data directory exists: `C:\data\db`

### Environment Variables
- Restart backend server after changing `.env`
- Ensure no spaces around `=` in `.env` file
- Check `.env` file is in `backend/` directory