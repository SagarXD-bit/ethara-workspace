# TaskFlow RBAC

TaskFlow RBAC is a full-stack project and task manager built for quick assessment delivery. It includes JWT authentication, role-based access control, project membership, task assignment, dashboard metrics, and a production-friendly monorepo layout for Railway deployment.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt
- Deployment target: Railway

## Features

- Admin and member authentication flows
- Admin-only project creation
- Admin-only member assignment and task assignment
- Member access limited to assigned projects
- Task status updates allowed for the project owner admin or the assigned member
- Dashboard metrics for total tasks, in-progress tasks, completed tasks, and overdue tasks
- Demo seed data for easy RBAC testing

## Project Structure

```text
backend/   Express API, Prisma schema, seed script
frontend/  React app, routes, dashboard UI
```

## Local Setup

1. Create a PostgreSQL database.
2. Copy [backend/.env.example](C:/Users/sagar/Documents/New%20project/backend/.env.example) to `backend/.env`.
3. Copy [frontend/.env.example](C:/Users/sagar/Documents/New%20project/frontend/.env.example) to `frontend/.env`.
4. Install dependencies:

```bash
npm install
```

5. Run Prisma migrations:

```bash
npm run prisma:migrate
```

6. Seed demo users and sample data:

```bash
npm run seed
```

7. Start the backend:

```bash
npm run dev:backend
```

8. In a second terminal, start the frontend:

```bash
npm run dev:frontend
```

## Demo Credentials

- Admin: `admin@example.com` / `Admin@123`
- Member: `member@example.com` / `Member@123`

These values can be changed through `backend/.env`.

## API Overview

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Dashboard

- `GET /api/dashboard`

### Projects

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `POST /api/projects/:id/members`

### Tasks

- `GET /api/projects/:id/tasks`
- `POST /api/projects/:id/tasks`
- `PUT /api/tasks/:id/status`

## Railway Deployment

This repo is set up so the backend can serve the built frontend in production.

1. Push the monorepo to GitHub.
2. Create a Railway project from the repository.
3. Add a PostgreSQL service in Railway.
4. Set environment variables for the backend service:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `MEMBER_EMAIL`
   - `MEMBER_PASSWORD`
5. Run the database migration in Railway:

```bash
npm run prisma:deploy --workspace backend
```

6. Optionally seed demo data:

```bash
npm run seed
```

7. Railway can then use:
   - Build command: `npm run build`
   - Start command: `npm start`

## Submission Checklist

- Show admin login
- Create a project
- Add a member to the project
- Assign a task
- Log in as the member
- Show that project creation is hidden or blocked
- Update the assigned task to `DONE`

## Notes

- The signup endpoint currently allows selecting `ADMIN` or `MEMBER` because that is useful for demos and assessments. In a production system, admin creation should be restricted.
- The frontend expects the API at `VITE_API_URL`, which defaults to `http://localhost:5000/api`.
