# Overview

This is a fitness tracking application that integrates with Strava to help users monitor their athletic activities and plan future workouts. The application provides a comprehensive dashboard for viewing activity statistics, planning workouts, and analyzing performance data through interactive charts and visualizations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface elements
- **Build Tool**: Vite for fast development and optimized production builds
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

The frontend follows a feature-based organization with components grouped by functionality (dashboard, navigation, UI primitives). The design system uses a comprehensive color palette optimized for fitness applications with Strava-branded orange as the primary color.

## Backend Architecture
The backend implements a REST API using Express.js with TypeScript:

- **Framework**: Express.js with TypeScript for type safety
- **Architecture Pattern**: RESTful API with route-based organization
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Session Management**: Token-based authentication with session storage
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

The backend uses a layered architecture separating concerns between routes, storage, and business logic. The storage layer is abstracted through interfaces, allowing for easy database integration later.

## Data Storage Solutions
The application uses a dual-storage approach:

- **Development**: In-memory storage implementation for rapid prototyping
- **Production Ready**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **Database Schema**: Comprehensive schema covering users, activities, planned activities, and user sessions
- **Migration System**: Drizzle Kit for database migrations and schema management

The schema includes proper relationships and indexing considerations for performance, with support for both manual activity entry and Strava synchronization.

## Authentication and Authorization
Authentication is handled through multiple mechanisms:

- **Strava OAuth**: Integration with Strava API for user authentication and data access
- **Session Management**: Custom session token system with expiration handling
- **Token Storage**: Client-side token storage with automatic header injection
- **Authorization Middleware**: Request-level authorization checks for protected endpoints

The system supports both authenticated and guest users, with conditional feature access based on authentication status.

## External Dependencies

### Third-Party Services
- **Strava API**: OAuth integration for user authentication and activity data synchronization
- **Neon Database**: PostgreSQL-compatible serverless database for production data storage

### UI and Styling Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Modern icon library for consistent iconography
- **Recharts**: React charting library for activity data visualization

### Development and Build Tools
- **Vite**: Fast build tool with development server and HMR support
- **Replit Integration**: Development environment optimizations and error handling
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire application

### Data Management
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support
- **Zod**: Runtime type validation for API requests and form data
- **TanStack React Query**: Server state management with caching and synchronization
- **Date-fns**: Date manipulation and formatting library

The application is designed for deployment on Replit with optimizations for the platform's development environment, including runtime error handling and build process integration.