# Changelog

All notable changes to this project are documented here.

## [1.0.0] — 2026-04-21

### Added
- User registration and login with JWT authentication
- Access token + refresh token flow (30-day refresh, 7-day access)
- Role-based access: `user` and `admin` roles
- Task CRUD: create, read, update, delete with ownership checks
- Task filtering by status, priority, tags; full-text search on title/description
- Pagination on all list endpoints (`page`, `limit`, `sortBy`, `sortOrder`)
- `GET /tasks/stats` aggregation endpoint (total, per-status, overdue count)
- Admin routes: list all users, toggle role, toggle active status, delete user
- Platform stats endpoint for admin dashboard
- Swagger UI docs at `/api/docs`
- Input validation via express-validator on all mutation routes
- Global error handler covering Mongoose, JWT, duplicate key errors
- Rate limiting: 100 req/15min globally, 20 req/15min on auth routes
- Winston logging to console and file (logs/combined.log, logs/error.log)
- Morgan HTTP request logging
- Helmet security headers
- CORS configured for dev (localhost:5173) and production
- React frontend: Login, Register, Dashboard, Tasks, Profile pages
- Admin panel with user table, search, role management
- JWT auto-refresh interceptor in Axios
- Protected and admin-only routes in React Router

### Changed
- Removed duplicate email index from User schema (unique field auto-creates index)

### Fixed
- Task `dueDate` validation now skips undefined values on update
- Admin cannot change their own role or deactivate their own account

## [0.2.0] — 2026-04-19

### Added
- Task model with status, priority, dueDate, tags, isPublic fields
- Task controller with pagination and aggregate stats
- Admin controller with user management endpoints
- React frontend scaffolding with Vite
- Authentication context with localStorage token persistence

## [0.1.0] — 2026-04-17

### Added
- Initial project setup
- Express app with middleware pipeline
- MongoDB connection with reconnect handling
- User model with bcrypt password hashing
- JWT utility functions (generateAccessToken, generateRefreshToken)
- Auth middleware with password-change detection
