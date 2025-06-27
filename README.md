# Fullstack MEAN Portfolio - Team Management & Reporting System

## 🎯 Project Overview

This is a production-grade fullstack web application showcasing a senior-level fullstack developer's expertise in building scalable enterprise applications. The system implements a Team Management and Reporting System with real-time capabilities and robust backend architecture.

## 🛠️ Tech Stack

### Frontend
- Angular (Latest version)
- RxJS
- Socket.IO Client
- Ngx-Charts
- PrimeNG UI Components
- Angular Material
- ExcelJS

### Backend
- Node.js with Express
- MongoDB with Mongoose
- BullMQ (Job Queue)
- Socket.IO
- JWT Authentication
- Winston (Logging)
- Swagger/OpenAPI

## 📁 Project Structure

```
my-professional-showcase/
├── frontend/           # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Core services and interceptors
│   │   │   ├── features/    # Feature modules
│   │   │   ├── shared/      # Shared components and services
│   │   │   └── theme/       # Theme configuration
│   │   ├── assets/         # Static assets
│   │   └── environments/   # Environment configurations
│   └── e2e/              # End-to-end tests
│
└── backend/            # Node.js application
    ├── src/
    │   ├── app/         # Express app configuration
    │   ├── config/      # Configuration files
    │   ├── controllers/ # Request handlers
    │   ├── middlewares/ # Custom middlewares
    │   ├── models/      # Mongoose models
    │   ├── routes/      # API routes
    │   ├── services/    # Business logic
    │   └── utils/       # Helper utilities
    └── tests/          # Unit tests
```

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- MongoDB (Local or Atlas)
- Angular CLI
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-professional-showcase
```

2. Backend Setup:
```bash
cd backend
npm install
# Copy .env.example to .env and update configurations
cp .env.example .env
# Start MongoDB
mongod
# Start backend server
npm run dev
```

3. Frontend Setup:
```bash
cd frontend
npm install
# Start frontend development server
ng serve
```

### Environment Variables

Create `.env` file in the backend directory with the following variables:
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/team-management
JWT_SECRET=your-secret-key
```

## 🏗️ Architecture

### Frontend Architecture
- **Modular Structure**:
  - Core Module: Authentication, HTTP interceptors, guards
  - Shared Module: Reusable components and services
  - Theme Module: Dynamic theming and customization
  - Feature Modules: Auth, Team, Report
- **State Management**:
  - RxJS for reactive state handling
  - BehaviorSubject for theme management
  - Custom interceptors for HTTP requests
- **UI Components**:
  - PrimeNG for enterprise-grade UI
  - Ngx-Charts for data visualization
  - Custom loading and error components
- **Error Handling**:
  - Global error interceptor
  - Toast notifications
  - Custom error dialogs
- **Security**:
  - JWT token management
  - Role-based access control
  - Route guards
- **Real-time Features**:
  - Socket.IO for live updates
  - Real-time notifications
  - Report status tracking
  - User presence tracking

### Backend Architecture
- **Clean Architecture**: Separation of concerns and dependency injection
- **Authentication**: JWT-based authentication with role-based access control
  - User registration and login
  - Role-based permissions (user, admin, superadmin)
  - Password hashing and security
  - Token-based authentication
- **Real-time Features**:
  - Socket.IO server implementation
  - User connection tracking
  - Report status updates
  - Notification broadcasting
- **Background Jobs**: BullMQ for processing reports and notifications
- **API Documentation**: Swagger/OpenAPI for API documentation

## 🔄 Real-time Communication Features

The application implements real-time communication using Socket.IO:

1. **User Presence**
   - Track online/offline status
   - Connection management
   - Reconnection handling

2. **Notifications**
   - Real-time notifications
   - Multiple notification types
   - Toast integration
   - Custom styling

3. **Report Status Updates**
   - Live report generation status
   - Progress tracking
   - Error handling
   - User-specific updates

4. **Security Features**
   - Token-based authentication
   - CORS configuration
   - Event validation
   - Error handling

5. **Performance Optimizations**
   - Efficient connection management
   - Event batching
   - Memory management
   - Error recovery

6. **Integration Points**
   - Report generation
   - User notifications
   - Team updates
   - Dashboard metrics

7. **Monitoring**
   - Connection tracking
   - Event logging
   - Error monitoring
   - Performance metrics

## 🎨 Frontend Theme System

The application features a dynamic theme system that allows:

1. **Customization Options**
   - Primary, secondary, and accent colors
   - Border radius
   - Box shadow
   - Font family
   - Background colors

2. **Theme Management**
   - Theme switching
   - Theme configuration
   - Local storage persistence
   - Real-time updates

3. **Component Integration**
   - Theme-aware components
   - Dynamic styling
   - Responsive design
   - Consistent UI across application

4. **Performance Optimizations**
   - Lazy loading of theme assets
   - Efficient theme switching
   - Minimal DOM updates
   - Caching of theme configurations

## 🔐 Authentication Setup

The authentication system implements:

1. **User Registration**
   - Email validation and uniqueness check
   - Password hashing with bcrypt
   - Role assignment (user, admin, superadmin)
   - JWT token generation

2. **User Login**
   - Secure password comparison
   - Token-based authentication
   - Role-based access control

3. **Security Features**
   - Rate limiting
   - Input validation
   - Password requirements
   - Secure token handling

4. **Error Handling**
   - Comprehensive error logging
   - User-friendly error messages
   - Security-focused error responses

## 🔐 Authentication API Endpoints

### Public Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Protected Routes
- All other routes require JWT token
- Role-based access control for admin routes
- Rate limiting for all API endpoints

## 📊 Features

### User Management
- User registration and authentication
- Role-based access control
- Team management
- User permissions and roles

### Reporting System
- Real-time report generation
- Bulk report processing via queues
- Excel/CSV export capabilities
- Custom report templates

### Real-time Features
- Live updates using Socket.IO
- Real-time job progress tracking
- Instant notifications

### Analytics
- Dashboard with visualizations
- Performance metrics
- Usage statistics

## 🛠️ Development Tools

- **Frontend**: Angular CLI, TypeScript, ESLint, Prettier
- **Backend**: ESLint, Prettier, Jest for testing
- **API Testing**: Postman collection included
- **Code Quality**: Husky for pre-commit hooks

## 📝 API Documentation

API documentation is available at `/api-docs` when the backend server is running.

## 🚀 Deployment

The project is Docker-ready with appropriate configurations for containerization.

## 📝 License

MIT License - feel free to use this code as a reference for your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the repository.

---

This project is designed to showcase enterprise-grade fullstack development practices and serves as a professional portfolio piece demonstrating:
- Clean architecture principles
- Scalable system design
- Real-time application development
- Robust security implementation
- Modern development practices
- Comprehensive documentation
