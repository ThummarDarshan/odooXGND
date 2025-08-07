# NexaUI - Full Stack Project

A modern web application built with Next.js frontend, Node.js backend, and MySQL database.

## 📁 Project Structure

```
Module/
├── frontend/          # Next.js React application
├── backend/           # Node.js Express API
└── database/          # MySQL schema and migrations
```

## 🚀 Quick Start

### 1. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:3000

### 2. Backend (Node.js/Express)
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run dev
```
Backend will run on: http://localhost:5000

### 3. Database (MySQL)
```bash
# Connect to MySQL and run schema
mysql -u root -p
source database/schema.sql
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **next-themes** - Dark/light mode

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Database
- **MySQL 8.0+** - Relational database
- **Connection pooling** - Performance optimization
- **Prepared statements** - Security

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. **Register**: `POST /api/auth/signup`
2. **Login**: `POST /api/auth/login`
3. **Protected routes**: Include `Authorization: Bearer <token>` header

## 📊 Database Schema

- **users** - User accounts and authentication
- **user_profiles** - Extended user information
- **notifications** - User notification system
- **sessions** - JWT token management

## 🌙 Dark/Light Theme

The frontend supports automatic dark/light theme switching with a toggle in the navigation bar.

## 📝 Sample Data

The database includes sample users for testing:
- Admin: `admin@nexaui.com` / `password123`
- John Doe: `john@example.com` / `password123`
- Jane Smith: `jane@example.com` / `password123`
- Bob Johnson: `bob@example.com` / `password123`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/:userId` - Get public profile

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy to your preferred platform
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
npm start
```

### Database (PlanetScale/AWS RDS)
- Use the schema in `database/schema.sql`
- Update connection strings in backend `.env`

## 📚 Documentation

- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)
- [Database Schema](database/schema.sql)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Email: support@nexaui.com
- Documentation: Check individual README files in each folder 