# GlobeTrotter Admin System

This document describes the admin functionality implemented in the GlobeTrotter project.

## Overview

The admin system provides comprehensive user management, activity monitoring, and administrative controls for the GlobeTrotter platform. Admins can manage users, view system statistics, send notifications, and maintain their own profiles.

## Features

### 🔐 Authentication & Access Control
- **Admin-only routes**: All admin endpoints require admin privileges
- **Role-based access**: Users with `admin` role can access admin features
- **Secure middleware**: Authentication and authorization checks on all admin routes

### 📊 Dashboard & Statistics
- **User statistics**: Total users, verified/unverified counts, recent registrations
- **System metrics**: Notification counts, activity monitoring
- **Real-time data**: Live statistics from the database

### 👥 User Management
- **User listing**: Paginated user list with search and filtering
- **User details**: View complete user profiles and activity
- **Status management**: Verify/unverify users, enable/disable accounts
- **Role management**: Change user roles (user/admin)
- **User deletion**: Soft delete users (disable accounts)

### 🔔 Notification System
- **Send notifications**: Broadcast to all users or specific users
- **Notification types**: System, message, promotion, like, follow
- **Priority levels**: Low, medium, high priority notifications
- **Activity tracking**: Monitor all system notifications

### 👤 Admin Profile Management
- **Profile editing**: Update personal information
- **Contact details**: Phone, location, website management
- **Social links**: JSON-based social media links
- **Preferences**: Custom admin preferences storage

## Database Schema

### Admin User
The admin user is created in the database with the following credentials:
- **Email**: `admin@globetrotter.com`
- **Password**: `password123`
- **Role**: `admin`
- **Status**: `verified`

### Tables Used
- `users`: Main user table with role-based access
- `user_profiles`: Extended profile information
- `notifications`: System notifications and activity tracking

## API Endpoints

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile

### User Management
- `GET /api/admin/users` - List users with pagination and filters
- `GET /api/admin/users/:id` - Get specific user details
- `PUT /api/admin/users/:id/status` - Update user verification status
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Disable user account

### Notifications
- `GET /api/admin/notifications` - List all notifications
- `POST /api/admin/notifications` - Send notifications

## Frontend Pages

### Admin Dashboard (`/admin`)
- **Statistics cards**: User counts, verification status, recent activity
- **User management table**: Search, filter, and manage users
- **Action buttons**: Verify/unverify, delete users
- **Pagination**: Navigate through user lists

### Admin Profile (`/admin/profile`)
- **Profile overview**: Display admin information
- **Edit mode**: Update personal details
- **Form validation**: Input validation and error handling
- **Real-time updates**: Immediate feedback on changes

### Admin Login (`/admin/login`)
- **Secure authentication**: Admin-only login
- **Role verification**: Ensures admin privileges
- **Redirect handling**: Automatic redirect to dashboard

## Usage Instructions

### 1. Access Admin Dashboard
1. Navigate to `/admin/login`
2. Login with admin credentials:
   - Email: `admin@globetrotter.com`
   - Password: `password123`
3. You'll be redirected to `/admin` dashboard

### 2. Manage Users
1. View the user management table
2. Use search and filters to find specific users
3. Click action buttons to:
   - **Verify/Unverify**: Toggle user verification status
   - **Delete**: Disable user account (soft delete)
   - **View Details**: See complete user information

### 3. Send Notifications
1. Use the notification system to communicate with users
2. Choose notification type and priority
3. Send to specific users or broadcast to all verified users

### 4. Update Admin Profile
1. Navigate to `/admin/profile`
2. Click "Edit Profile" to enter edit mode
3. Update your information
4. Save changes

## Security Features

### Authentication
- JWT-based authentication
- Token validation on all admin routes
- Automatic token refresh

### Authorization
- Role-based access control
- Admin-only middleware
- Secure route protection

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## Development Setup

### Backend Setup
1. Ensure the database is running
2. Run the schema.sql to create tables and admin user
3. Start the backend server: `npm start`

### Frontend Setup
1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Access admin features at `/admin`

### Environment Variables
Ensure these environment variables are set:
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Admin Credentials

### Default Admin Account
- **Email**: `admin@globetrotter.com`
- **Password**: `password123`
- **Role**: `admin`
- **Status**: `verified`

### Creating Additional Admins
1. Register a new user through the signup process
2. Use the admin dashboard to change their role to `admin`
3. Verify the new admin account

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Ensure you're logged in with admin credentials
   - Check that the user has `admin` role
   - Verify JWT token is valid

2. **Database Connection Issues**
   - Check database server is running
   - Verify connection settings in `config/database.js`
   - Ensure schema has been applied

3. **Frontend Not Loading**
   - Check if backend server is running on port 5000
   - Verify CORS settings
   - Check browser console for errors

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## API Documentation

### Authentication Headers
All admin API calls require the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Response Format
All API responses follow this format:
```json
{
  "message": "Success message",
  "data": {...},
  "error": "Error message (if applicable)"
}
```

### Error Handling
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient privileges
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

## Future Enhancements

### Planned Features
- **Advanced analytics**: Detailed user activity reports
- **Bulk operations**: Mass user management
- **Audit logs**: Complete action tracking
- **Email templates**: Customizable notification templates
- **API rate limiting**: Enhanced security measures

### Integration Possibilities
- **Third-party auth**: OAuth integration
- **Multi-tenant support**: Multiple admin organizations
- **Real-time updates**: WebSocket notifications
- **Mobile admin app**: React Native admin interface

## Support

For issues or questions regarding the admin system:
1. Check the troubleshooting section
2. Review the API documentation
3. Check server logs for detailed error messages
4. Verify database connectivity and schema

---

**Note**: This admin system is designed for internal use and should be properly secured in production environments. 