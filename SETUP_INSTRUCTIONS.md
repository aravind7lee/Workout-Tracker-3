# 🏋️ GYM Tracker - Complete Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
3. **Git** - [Download here](https://git-scm.com/)

### 📦 Installation Steps

#### 1. Install MongoDB
- Download and install MongoDB Community Server
- Create data directory: `C:\data\db` (Windows) or `/data/db` (Mac/Linux)
- Start MongoDB service

#### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm run dev
```

#### 3. Frontend Setup
```bash
# Navigate to frontend folder (in new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 🎯 Easy Start (Windows)
1. Double-click `start-backend.bat` to start backend
2. Double-click `start-project.bat` to start frontend

### 🔧 Configuration

#### Backend (.env file already created)
- MongoDB URI: `mongodb://localhost:27017/gym-tracker`
- JWT Secret: Pre-configured
- Port: 5000

#### Frontend
- API URL: `http://localhost:5000/api`
- Frontend URL: `http://localhost:5175`

### 🧪 Testing Authentication

#### Demo Account
- **Email**: `demo@gym.com`
- **Password**: `demo123`

#### Or Register New Account
1. Go to `http://localhost:5175/register`
2. Fill in your details
3. Click "Create Account"

### 🛠️ Troubleshooting

#### CORS Error Fix
✅ **Already Fixed!** The backend now includes proper CORS configuration for:
- `http://localhost:5173`
- `http://localhost:5174` 
- `http://localhost:5175`
- `http://localhost:3000`

#### MongoDB Connection Issues
1. Make sure MongoDB is running
2. Check if port 27017 is available
3. Verify data directory exists

#### Port Issues
- Backend: Change PORT in `.env` file
- Frontend: Change port in `vite.config.js`

### 🎉 Success Indicators

✅ **Backend Running**: Console shows "🚀 Server running on port 5000"
✅ **MongoDB Connected**: Console shows "✅ MongoDB connected successfully"  
✅ **Frontend Running**: Browser opens to `http://localhost:5175`
✅ **Authentication Working**: Can register/login without CORS errors

### 🔥 Features Now Working

- ✅ **Real Backend Authentication** with MongoDB
- ✅ **User Registration & Login**
- ✅ **JWT Token Management**
- ✅ **Password Hashing with bcrypt**
- ✅ **CORS Fixed for all ports**
- ✅ **Professional UI/UX**
- ✅ **Demo Account System**
- ✅ **Real-time Workout Tracking**
- ✅ **Plan Management System**

### 📱 Professional Features

1. **Authentication System**
   - Secure registration/login
   - JWT token management
   - Password encryption
   - Demo account access

2. **Workout Management**
   - Create custom workout plans
   - Real-time workout tracking
   - Exercise library with 48+ exercises
   - Progress monitoring

3. **User Experience**
   - Mobile-responsive design
   - Professional gym app UI
   - Real-time updates
   - Smooth animations

### 🎯 Next Steps

1. Start both servers using the batch files
2. Open `http://localhost:5175` in your browser
3. Register a new account or use demo account
4. Explore all the professional gym features!

---

**🏆 You now have a complete, professional-grade gym tracking application with real backend authentication and MongoDB storage!**