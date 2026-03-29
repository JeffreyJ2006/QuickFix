# QuickFix Backend API

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v16+ installed
- MongoDB installed locally OR MongoDB Atlas account
- VS Code or any code editor

### Step 1: Setup Project

```bash
# Create project folder
mkdir quickfix-backend
cd quickfix-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv cors socket.io multer cloudinary express-validator nodemailer

# Install dev dependencies
npm install --save-dev nodemon
```

### Step 2: Create Folder Structure

```bash
mkdir -p src/config src/models src/routes src/middleware src/controllers
```

Your structure should look like:
```
quickfix-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── complaints.js
│   │   ├── messages.js
│   │   └── admin.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   └── server.js
├── .env
├── .gitignore
└── package.json
```

### Step 3: Update package.json Scripts

Add these scripts to your `package.json`:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### Step 4: Create .env File

Create `.env` in root directory with:

```env
PORT=5000
NODE_ENV=development

# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/quickfix

# Or MongoDB Atlas (recommended)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickfix?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=24h

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Step 5: Create .gitignore

```
node_modules/
.env
.DS_Store
*.log
```

### Step 6: Copy All Files

Copy all the provided files into their respective folders:
- `src/server.js` - Main server file
- `src/config/database.js` - MongoDB connection
- `src/config/cloudinary.js` - Image upload config
- `src/models/*.js` - All models
- `src/routes/*.js` - All routes
- `src/middleware/*.js` - All middleware

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. **Install MongoDB**: Download from https://www.mongodb.com/try/download/community

2. **Start MongoDB**:
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod
```

3. **Verify Connection**:
```bash
mongosh
# Should connect to mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `.env` with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quickfix?retryWrites=true&w=majority
   ```

## ☁️ Cloudinary Setup (Image Uploads)

1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud name
   - API Key
   - API Secret
5. Update `.env` with these values

## 🏃‍♂️ Running the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

You should see:
```
==================================================
🚀 Server running on port 5000
📡 Socket.IO listening on port 5000
🌍 Environment: development
📝 API Docs: http://localhost:5000/api
==================================================
✅ MongoDB Connected: localhost
📊 Database Name: quickfix
```

## 📡 Testing API Endpoints

### Using Thunder Client (VS Code Extension)

1. Install "Thunder Client" extension in VS Code
2. Import these requests:

**Register User:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "STUDENT",
  "phoneNumber": "9876543210",
  "rollNumber": "2021CS001",
  "hostel": "Hostel A",
  "roomNumber": "101"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```

**Create Complaint (requires token):**
```
POST http://localhost:5000/api/complaints
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Broken Light in Room",
  "description": "The ceiling light is not working",
  "category": "Electrical",
  "location": {
    "hostel": "Hostel A",
    "roomNumber": "101"
  },
  "priority": "Medium"
}
```

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Kill process on port 5000 or change port in .env
```bash
# Find process
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue 3: Cloudinary Upload Failed
**Solution**: Verify credentials in .env are correct

### Issue 4: JWT Token Error
**Solution**: Make sure JWT_SECRET in .env is set

## 📚 API Documentation

Visit `http://localhost:5000/api` for complete endpoint list.

### Available Endpoints:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

**Complaints:**
- `POST /api/complaints` - Create complaint (Student)
- `GET /api/complaints` - Get user's complaints (Protected)
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id/status` - Update status (Worker)
- `POST /api/complaints/:id/feedback` - Submit feedback (Student)
- `DELETE /api/complaints/:id` - Cancel complaint

**Messages:**
- `POST /api/messages` - Send message
- `GET /api/messages/:complaintId` - Get message history
- `PUT /api/messages/:messageId/read` - Mark as read

**Users:**
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/avatar` - Upload avatar
- `PUT /api/users/availability` - Update availability (Worker)

**Admin:**
- `GET /api/admin/dashboard` - Get statistics
- `GET /api/admin/complaints` - Get all complaints
- `PUT /api/admin/complaints/:id/reassign` - Reassign complaint
- `GET /api/admin/workers` - Get all workers
- `PUT /api/admin/workers/:id/verify` - Verify worker
- `DELETE /api/admin/workers/:id` - Delete worker

## 🔐 Default Admin Account

Create admin manually in MongoDB:

```javascript
// In MongoDB Compass or mongosh
use quickfix

db.users.insertOne({
  name: "Admin User",
  email: "admin@quickfix.com",
  password: "$2a$10$YourHashedPasswordHere", // Hash using bcrypt
  role: "ADMIN",
  isVerified: true,
  createdAt: new Date()
})
```

Or use this Node.js script:

```javascript
// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const User = require('./src/models/User');

async function createAdmin() {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@quickfix.com',
    password: 'admin123', // Will be hashed automatically
    role: 'ADMIN',
    isVerified: true
  });
  console.log('Admin created:', admin.email);
  process.exit();
}

createAdmin();
```

Run: `node createAdmin.js`


