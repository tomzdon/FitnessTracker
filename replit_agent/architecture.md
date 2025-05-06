# Architecture Overview

## 1. Overview

This repository contains a full-stack web application built with React on the frontend and Express.js on the backend. The application appears to be a fitness platform called "CGX.tv" that allows users to browse workouts, track progress, manage favorites, and view their workout history.

The architecture follows a client-server model with a clear separation between the frontend client application (built with React) and the backend API server (built with Express.js). The application uses a PostgreSQL database (hosted on Supabase) for data persistence with Drizzle ORM for database schema management and queries.

## 2. System Architecture

### High-Level Architecture

The application follows a monorepo structure with clear separation of concerns:

```
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared code between client and server (schemas, types)
├── migrations/       # Database migration files
└── scripts/          # Utility scripts
```

### Frontend Architecture

The frontend is a single-page application (SPA) built with React. It uses:

- **Vite** as the build tool and development server
- **React Router** (via `wouter`) for client-side routing
- **TanStack Query** (formerly React Query) for data fetching, caching, and state management
- **Tailwind CSS** for styling, enhanced with the **shadcn/ui** component library
- **Radix UI** primitives for accessible UI components
- **React Hook Form** with **Zod** for form validation

### Backend Architecture

The backend is built with Express.js and follows a RESTful API architecture:

- **Express.js** for handling HTTP requests
- **Passport.js** for authentication
- **Drizzle ORM** for database access and query building
- **Session-based authentication** using cookies and PostgreSQL session storage

### Data Storage

- **PostgreSQL** database hosted on Supabase
- **Drizzle ORM** for database schema definition and type-safe queries
- **Schema-driven development** with shared schema definitions between frontend and backend

## 3. Key Components

### Frontend Components

1. **Authentication System**
   - Login/register forms with validation
   - Protected routes requiring authentication
   - Global authentication state management

2. **Dashboard**
   - Statistics display
   - Favorite workouts gallery

3. **Calendar**
   - Workout scheduling interface
   - Day-by-day workout planning

4. **Discover Page**
   - Browse and filter available workouts
   - Content categorization

5. **Profile Management**
   - User information
   - Workout history
   - Settings and preferences

6. **UI Component Library**
   - Comprehensive set of reusable UI components based on shadcn/ui

### Backend Components

1. **Authentication API**
   - User registration and login
   - Session management
   - Password hashing and security

2. **Data Storage Layer**
   - Database connection and pooling
   - ORM integration

3. **API Routes**
   - RESTful endpoints for data access
   - Protected routes requiring authentication
   - Statistics aggregation

4. **Session Management**
   - Cookie-based sessions
   - Session persistence in PostgreSQL

## 4. Data Flow

### Authentication Flow

1. User submits login/registration form
2. Backend validates credentials
3. On success, a session is created and stored in the database
4. Session cookie is sent to the client
5. Client includes session cookie in subsequent requests
6. Backend validates session on protected routes

### Data Access Flow

1. Client makes API request to backend endpoint
2. Backend verifies authentication if required
3. Backend processes request and queries database using Drizzle ORM
4. Database returns results to backend
5. Backend transforms data as needed and sends response to client
6. Client receives data and updates UI accordingly

### State Management

- Global authentication state using React Context
- Server state management using TanStack Query
- Form state management using React Hook Form

## 5. External Dependencies

### Frontend Dependencies

- **Core**: React, TypeScript, Vite
- **Routing**: wouter (lightweight alternative to React Router)
- **Data Fetching**: TanStack Query
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form, Zod
- **Date Handling**: date-fns

### Backend Dependencies

- **Core**: Express.js, TypeScript
- **Authentication**: Passport.js
- **Database**: Drizzle ORM, PostgreSQL driver
- **Session Management**: express-session, connect-pg-simple
- **Security**: Node.js crypto for password hashing

### Infrastructure

- **Database**: Supabase PostgreSQL
- **Deployment**: Replit (configured for auto-deployment)

## 6. Database Schema

The application uses a relational database with the following main entities:

1. **Users**:
   - Core user information (username, password, email)
   - Profile details (name, gender, age)
   - Fitness preferences (fitness level, goals, preferred workout days)

2. **Workouts**:
   - Workout details (title, description, duration)
   - Categorization (type, difficulty)
   - Media references (image URL)

3. **Favorites**:
   - User-workout relationship for saved favorites

4. **Completed Workouts**:
   - Tracking history of user-completed workouts
   - Timestamps for progress tracking

5. **Progress Tests**:
   - User fitness assessments
   - Results tracking

The schema includes proper relationships between entities, such as foreign keys between users and their completed workouts or favorites.

## 7. Deployment Strategy

The application is configured for deployment on Replit, with the following setup:

- **Development**: `npm run dev` using tsx for TypeScript execution
- **Production Build**: Vite for frontend, esbuild for backend
- **Production Start**: Node.js for the bundled application

The deployment configuration includes:

- **Environment Variables**: Management via `.env` files and Replit secrets
- **Database Connection**: Configured for Supabase PostgreSQL
- **Port Configuration**: Exposed on port 5000 locally, mapped to port 80 externally
- **Build Process**: Two-step build for both frontend and backend components

In a production environment, the application serves the static frontend assets from the Express.js server while providing API endpoints for dynamic data.