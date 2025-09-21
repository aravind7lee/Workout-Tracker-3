# 🚀 Deployment Fix Guide

## Issue Fixed
- ❌ Frontend trying to connect to `https://grindx-backend.vercel.app/auth/login` getting 404
- ❌ "Backend server not found. Please check deployment." error
- ❌ CORS issues between frontend and backend

## ✅ Files Updated

### Backend Changes:
1. **server.js** - Updated CORS to allow all Vercel deployments
2. **routes/auth.js** - Added debug logging
3. **vercel.json** - Already configured correctly

### Frontend Changes:
1. **.env.production** - Updated to use correct backend URL
2. **vercel.json** - Created with proper environment variables
3. **authService.js** - Better error handling

## 🔧 Deployment Steps

### 1. Deploy Backend First
```bash
cd backend
# Make sure you have these environment variables in Vercel:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# NODE_ENV=production

# Deploy to Vercel
vercel --prod
```

### 2. Deploy Frontend
```bash
cd frontend
# Deploy to Vercel
vercel --prod
```

### 3. Environment Variables Needed

#### Backend (Vercel Dashboard):
- `MONGO_URI` = Your MongoDB Atlas connection string
- `JWT_SECRET` = Any secure random string (32+ characters)
- `NODE_ENV` = production

#### Frontend (Vercel Dashboard):
- `VITE_API_BASE` = https://grindx-backend.vercel.app/api

## 🧪 Test Your Deployment

1. Visit your backend URL: `https://grindx-backend.vercel.app/api/health`
   - Should return JSON with status "OK"

2. Visit your frontend URL and try to register/login
   - Should work without 404 errors

## 🔍 Troubleshooting

If still getting 404 errors:
1. Check Vercel function logs for backend
2. Verify environment variables are set
3. Make sure MongoDB Atlas allows connections from 0.0.0.0/0
4. Check that JWT_SECRET is set in backend environment

## 📝 Quick Fix Commands

If you need to redeploy quickly:
```bash
# Backend
cd backend && vercel --prod

# Frontend  
cd frontend && vercel --prod
```