# Admin Dashboard - Backend API

RESTful API built with Node.js, Express, and MongoDB for the Admin Dashboard application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see below)

# Seed admin user (optional)
node scripts/seedAdmin.js

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   └── db.js           # MongoDB connection
├── controllers/         # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── eventController.js
│   ├── messageController.js
│   ├── reportController.js
│   └── settingController.js
├── middleware/          # Custom middleware
│   ├── authMiddleware.js    # JWT authentication
│   ├── upload.js            # File upload (Multer)
│   └── errorMiddleware.js   # Error handling
├── models/              # Mongoose models
│   ├── User.js
│   ├── Event.js
│   ├── Message.js
│   └── Setting.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── eventRoutes.js
│   ├── messageRoutes.js
│   ├── reportRoutes.js
│   ├── settingRoutes.js
│   └── health.js
├── scripts/             # Utility scripts
│   └── seedAdmin.js    # Seed admin user
├── uploads/             # File upload directory
└── server.js            # Express server entry point
```

## ⚙️ Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/admin-dashboard

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS (optional)
FRONTEND_URL=http://localhost:5173
```

## 🗄️ Database Models

### User
- name, email, password (hashed)
- role (admin/user)
- status (active/blocked)
- timestamps

### Event
- title, description, location, date, time
- category, image
- status (pending/approved/rejected)
- createdBy (user reference)
- timestamps

### Message
- fullName, email, subject, message
- isRead (boolean)
- timestamps

### Setting
- brandName, primaryColor, logo
- singleton document

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/login       - User login
POST   /api/auth/register    - User registration
```

### Users (Protected)
```
GET    /api/users            - Get all users
POST   /api/users            - Create user
PUT    /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user
PATCH  /api/users/:id/block  - Block user
PATCH  /api/users/:id/unblock - Unblock user
```

### Events (Protected)
```
GET    /api/events           - Get all events
POST   /api/events           - Create event (multipart/form-data)
PUT    /api/events/:id       - Update event (multipart/form-data)
DELETE /api/events/:id       - Delete event
PATCH  /api/events/:id/approve - Approve event
PATCH  /api/events/:id/reject  - Reject event
```

### Messages (Protected)
```
GET    /api/messages         - Get all messages
GET    /api/messages/:id     - Get message by ID
PATCH  /api/messages/:id/read - Mark as read
DELETE /api/messages/:id     - Delete message
```

### Reports (Protected)
```
GET    /api/reports/summary          - Summary statistics
GET    /api/reports/event-status     - Event status distribution
GET    /api/reports/monthly-users    - Monthly user registrations
GET    /api/reports/recent-activity  - Recent activity log
```

### Settings (Protected)
```
GET    /api/settings                 - Get settings
PUT    /api/settings                 - Update settings
POST   /api/settings/upload-logo     - Upload logo (multipart/form-data)
```

### Health
```
GET    /api/health           - Health check
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. POST credentials to `/api/auth/login`
2. Receive JWT token in response
3. Include token in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

### Protected Routes
All routes except `/api/auth/*` and `/api/health` require authentication.

## 📤 File Uploads

File uploads use Multer middleware:
- **Events**: Image upload (jpg, jpeg, png, gif)
- **Settings**: Logo upload (jpg, jpeg, png, gif)
- Max file size: 5MB
- Files stored in `uploads/` directory

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS enabled
- Input validation
- Error handling middleware
- Protected routes

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

## 🔧 Development

### Seed Admin User
```bash
node scripts/seedAdmin.js
```

Creates an admin user:
- Email: admin@example.com
- Password: password

### Start Development Server
```bash
npm run dev
```

Uses nodemon for auto-restart on file changes.

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **multer** - File upload
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **morgan** - HTTP request logger

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Use MongoDB Atlas or production database
4. Set up proper CORS origins
5. Use process manager (PM2)
6. Set up reverse proxy (Nginx)
7. Enable HTTPS

## 📝 Notes

- All timestamps are in UTC
- File uploads are stored locally (consider cloud storage for production)
- Database indexes are created automatically by Mongoose
- Error responses follow consistent format
