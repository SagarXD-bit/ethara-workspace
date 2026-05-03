# 🚀 Ethara Workspace

A full-stack task and project management platform with secure authentication, role-based access control, and real-time API integration.

---

## 🌐 Live Demo

* **Frontend:** https://ethara-workspace-frontend.vercel.app
* **Backend API:** https://backend-production-1b5a.up.railway.app

---

## 🧠 Features

* 🔐 User Authentication (Signup/Login with JWT)
* 👤 Role-based Access (Admin / Member)
* 📁 Project Management
* ✅ Task Tracking System
* 🌐 REST API integration
* ⚡ Modern UI with Vite + React
* ☁️ Cloud deployment (Vercel + Railway)

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* JavaScript
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL

### Deployment

* Vercel (Frontend)
* Railway (Backend + Database)

---

## 📂 Project Structure

```
ethara-workspace/
│
├── frontend/        # React + Vite app
├── backend/         # Express + Prisma API
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Local Setup

### 1. Clone repository

```
git clone https://github.com/SagarXD-bit/ethara-workspace.git
cd ethara-workspace
```

---

### 2. Setup Backend

```
cd backend
npm install
npx prisma migrate dev
npm run dev
```

---

### 3. Setup Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🔐 Authentication Flow

1. User signs up → password hashed with bcrypt
2. JWT token generated on login
3. Protected routes require:

```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/login`

### Projects

* `GET /api/projects`
* `POST /api/projects`

### Tasks

* `GET /api/tasks`
* `POST /api/tasks`

---

## ⚠️ Common Issues

* ❌ **Failed to fetch** → Check `VITE_API_URL`
* ❌ **401 Unauthorized** → Invalid credentials / missing token
* ❌ **CORS error** → Ensure backend allows frontend origin
* ❌ **JWT error** → Missing `JWT_SECRET`

---

## 🧑‍💻 Author

**Sagar Rawat**
GitHub: https://github.com/SagarXD-bit

---

## ⭐ Acknowledgements

* Prisma ORM
* Railway
* Vercel
* Vite

---

## 📌 Future Improvements

* Role-based dashboard UI
* Notifications system
* File uploads
* Real-time updates (WebSockets)

---

## 📄 License

This project is open-source and available under the MIT License.
