# ⚡ Primetrade Task Manager API

> Scalable REST API with JWT Authentication, Role-Based Access Control, and a React frontend.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| Docs | Swagger UI (OpenAPI 3.0) |
| Logging | Winston, Morgan |
| Frontend | React (Vite), React Router v6 |

---

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, Swagger config
│   │   ├── controllers/    # authController, taskController, adminController
│   │   ├── middleware/     # auth.js, role.js, validate.js, errorHandler.js
│   │   ├── models/         # User.js, Task.js
│   │   ├── routes/v1/      # auth.js, tasks.js, admin.js
│   │   └── utils/          # apiResponse.js, logger.js
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── contexts/       # AuthContext (JWT state management)
        ├── lib/            # api.js (Axios + auto refresh)
        ├── pages/          # Login, Register, Dashboard, Tasks, Profile, Admin
        └── components/     # Layout
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI and JWT secrets
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔑 Environment Variables (backend/.env)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_EXPIRES_IN` | Access token expiry (e.g. `7d`) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `30d`) |
| `RATE_LIMIT_MAX` | Max requests per window (default 100) |

---

## 📡 API Endpoints (v1)

### Auth `/api/v1/auth`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT tokens |
| POST | `/refresh` | Public | Refresh access token |
| POST | `/logout` | Private | Revoke refresh token |
| GET | `/me` | Private | Get current user profile |
| PUT | `/me` | Private | Update name/email |
| PUT | `/change-password` | Private | Change password |

### Tasks `/api/v1/tasks`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Private | List tasks (paginated, filtered) |
| POST | `/` | Private | Create task |
| GET | `/stats` | Private | Task statistics |
| GET | `/:id` | Private | Get single task |
| PUT | `/:id` | Private | Update task (owner/admin) |
| DELETE | `/:id` | Private | Delete task (owner/admin) |

### Admin `/api/v1/admin`
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/stats` | Admin | Platform statistics |
| GET | `/users` | Admin | List all users (paginated) |
| GET | `/users/:id` | Admin | Get user by ID |
| PUT | `/users/:id/role` | Admin | Change user role |
| PUT | `/users/:id/status` | Admin | Toggle active status |
| DELETE | `/users/:id` | Admin | Delete user + tasks |
| GET | `/tasks` | Admin | List all tasks |

**API Docs:** http://localhost:5000/api/docs

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT**: Short-lived access tokens (7d) + long-lived refresh tokens (30d)
- **Token Refresh**: Auto-refresh in frontend Axios interceptor
- **Role-Based Access**: `user` and `admin` roles enforced server-side
- **Rate Limiting**: 100 req/15min globally, 20 req/15min on auth routes
- **Helmet**: Secure HTTP headers
- **Input Validation**: express-validator on all mutation endpoints
- **Password Change Detection**: JWT invalidated if password changed after issue
- **Ownership Guard**: Users can only modify their own tasks

---

## 🎯 Frontend Features

- Register / Login with form validation
- JWT stored in localStorage, auto-refreshed on expiry
- Protected routes (unauthenticated → redirect to login)
- Admin route (non-admin → redirect to dashboard)
- **Dashboard**: Stats overview + recent tasks
- **Tasks**: Full CRUD with filters, search, pagination, tags, due dates
- **Profile**: Edit name/email, change password
- **Admin Panel**: User table with role promotion, status toggle, delete

---

## 📊 Database Schema

### User
```
_id, name, email (unique), password (hashed), role (user|admin),
isActive, refreshToken, lastLogin, passwordChangedAt, timestamps
```

### Task
```
_id, title, description, status (todo|in_progress|completed|archived),
priority (low|medium|high|urgent), dueDate, tags[], isPublic,
createdBy (ref User), assignedTo (ref User), completedAt, timestamps
```

---

## 📈 Scalability Notes

### Current Architecture
- **Modular MVC** structure ready for new modules (just add model/controller/route)
- **API versioning** (`/api/v1/`) — `v2` routes can coexist without breaking changes
- **Compound DB indexes** on frequently queried field combinations

### Scaling Path

1. **Horizontal Scaling**: App is stateless (JWT-based) — deploy multiple instances behind a load balancer (Nginx/AWS ALB)
2. **Database**: MongoDB Atlas auto-sharding, or replica sets for read scaling
3. **Caching**: Add Redis for session store, rate limiting, and response caching of stats
4. **Microservices**: Split auth, tasks, notifications into separate services with API Gateway
5. **Message Queue**: Use BullMQ/RabbitMQ for async tasks (email notifications, audit logs)
6. **CDN**: Serve React frontend via Cloudflare/CloudFront
7. **Docker**: Each service containerized, orchestrated with Kubernetes or Docker Compose

### Docker (optional)
```bash
# Backend
docker build -t primetrade-api ./backend
docker run -p 5000:5000 --env-file ./backend/.env primetrade-api
```

---

## 🧪 Testing the API

Import the Swagger collection: **http://localhost:5000/api/docs**

Quick test flow:
1. `POST /api/v1/auth/register` → get `accessToken`
2. Click "Authorize" in Swagger, paste token
3. `POST /api/v1/tasks` → create task
4. `GET /api/v1/tasks` → list tasks

---

Built for Primetrade.ai Backend Developer Intern Assignment.
# Primetrade-ai
