# NexaUI Backend API

A Node.js/Express backend API for the NexaUI project with MySQL database, JWT authentication, and comprehensive user management.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Complete CRUD operations for users and profiles
- **Notifications**: Real-time notification system with priority levels
- **Profile Management**: User profiles with bio, location, social links
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MySQL with connection pooling and prepared statements
- **API Documentation**: Comprehensive REST API endpoints

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nexaui_db
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up MySQL database**
   ```bash
   # Connect to MySQL
   mysql -u root -p
   
   # Run the schema file
   source ../database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Setup

The database schema includes:

- **users**: User accounts with authentication
- **user_profiles**: Extended user information
- **notifications**: User notification system
- **sessions**: JWT token management

Run the schema file in `database/schema.sql` to create all tables, indexes, and sample data.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/:id/verify` - Verify user account (admin only)

### Notifications
- `GET /api/notifications` - Get user's notifications
- `POST /api/notifications` - Create notification
- `GET /api/notifications/:id` - Get specific notification
- `PUT /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/delete-read` - Delete read notifications

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/profile/:userId` - Get public profile
- `DELETE /api/profile` - Reset profile

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Example Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Example Protected Request
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 📝 Sample Data

The database comes with sample data for testing:

**Users:**
- Admin: `admin@nexaui.com` / `password123`
- John Doe: `john@example.com` / `password123`
- Jane Smith: `jane@example.com` / `password123`
- Bob Johnson: `bob@example.com` / `password123`

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🔧 Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── notifications.js     # Notification routes
│   └── profile.js           # Profile routes
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # This file
```

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `DB_PORT`: MySQL port
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration time
- `CORS_ORIGIN`: Allowed CORS origin

## 🚀 Deployment

1. **Set environment variables for production**
2. **Build the application**
3. **Use a process manager like PM2**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "nexaui-backend"
   ```

## 📚 API Documentation

### Request/Response Format

All API responses follow this format:
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if any)"
}
```

### Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Validation

Input validation is handled using `express-validator` with detailed error messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@nexaui.com or create an issue in the repository. 