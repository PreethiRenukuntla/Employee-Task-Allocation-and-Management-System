# Employee Task Allocation and Tracking System

A full-stack, role-based MERN web application built for seamless management of organizations, managers, employees, and tasks. It leverages modern UI techniques using React + Tailwind CSS with a secure Backend API powered by Node.js, Express, and MongoDB.

## Features

- **Role Based Access Control:**
  - **Admin**: System-wide view, user management, overall statistics.
  - **Employer**: Company metrics, manager performance.
  - **Manager**: Task assignment, tracking, and employee management.
  - **Employee**: Task viewing, updating status, and productivity.
- **Modern UI**: Dark-mode glassmorphic design system using Tailwind CSS and Lucide React icons.
- **Secure Authentication**: JWT-based session management, bcrypt password hashing.

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, React Router, Recharts, Axios, Lucide React
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt

## Setup Instructions

### 1. Backend Setup
1. Open terminal and navigate to the `backend` folder.
   `cd backend`
2. Install dependencies:
   `npm install`
3. Modify `.env` in the backend folder (if needed).
4. Run the database seed to insert dummy users and tasks:
   `npm run data:import`
5. Start the development server:
   `npm run dev` (Runs on `http://localhost:5000`)

### 2. Frontend Setup
1. Open another terminal and navigate to the `frontend` folder.
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the Vite React app:
   `npm run dev`

### 3. Default Login Credentials
Use these accounts to test the role-based dashboards:
- **Admin**: `admin@system.com` / `password123`
- **Employer**: `employer@company.com` / `password123`
- **Manager**: `manager@company.com` / `password123`
- **Employee**: `employee1@company.com` / `password123`

---

Built as an optimal showcase of agentic full-stack development, prioritizing visual excellence and structured codebase best practices.
