# Fullstack Technical Assignment - Node.js & React

## 📋 Project Overview

The application is designed to meet specific technical requirements including RESTful API development, secure authentication, database management, and background task scheduling.

### Key Features Implemented

* [cite_start]**RESTful API**: Complete CRUD operations for a To-Do list application[cite: 9, 12].
* [cite_start]**Database Management**: PostgreSQL integration using Sequelize ORM with relational models (User, Todo, ScheduledTask)[cite: 16, 18].
* **Secure Authentication**: 
    * [cite_start]JWT (JSON Web Token) implementation for stateless authentication[cite: 13].
    * [cite_start]**HttpOnly Cookies** to prevent XSS attacks (more secure than localStorage)[cite: 39].
    * [cite_start]Password hashing using `bcrypt`[cite: 40].
* [cite_start]**Real-time Infrastructure**: Socket.io server initialized to handle real-time bidirectional communication[cite: 24].
* [cite_start]**Task Scheduling**: A background scheduler system (`node-cron`) to manage and log periodic tasks[cite: 44, 46].
* [cite_start]**Frontend Integration**: CORS configured to allow secure requests from the React frontend running on port 4000[cite: 30].

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: PostgreSQL (via Sequelize ORM)
* **Real-time**: Socket.io
* **Authentication**: JWT, Bcrypt, Cookie-Parser
* **Scheduling**: Node-cron (custom scheduler implementation)

## 🚀 Getting Started

### Prerequisites
* Node.js (v16+)
* PostgreSQL running locally

### 1. Database Setup
Create a local PostgreSQL database named `fullstack_db` (or update `.env` to match your existing DB).

### 2. Backend Setup (Server)

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` root with the following configuration:
    ```env
    PORT=3000
    ACCESS_TOKEN_SECRET=your_super_secret_key_change_this
    NODE_ENV=development
    
    # Database Settings
    DB_USERNAME=postgres
    DB_PASSWORD=your_password
    DB_NAME=fullstack_db
    DB_HOST=127.0.0.1
    DB_PORT=5432
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    *The server runs on http://localhost:3000*

### 3. Frontend Setup (Client)

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React application:
    ```bash
    npm run dev
    ```
    *Ensure the client runs on **http://localhost:4000** to match the server's CORS settings.*

## 🔌 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/login` | Authenticate user & set HttpOnly cookie | No |
| `POST` | `/logout` | Clear authentication cookie | Yes |
| `GET` | `/me` | Get current logged-in user details | Yes |
| **Todos** | | | |
| `GET` | `/todos` | Retrieve all todos for the user | Yes |
| `POST` | `/todos` | Create a new todo item | Yes |
| `PUT` | `/todos/:id` | Update a todo (title/completion) | Yes |
| `DELETE` | `/todos/:id` | Delete a todo | Yes |





| **System** | | | |
| `GET` | `/api/scheduled-tasks` | List all background scheduled tasks | Yes |
| `GET` | `/api/scheduled-tasks/:id/logs` | View execution logs for specific tasks | Yes |





login page 
<img width="644" height="448" alt="スクリーンショット 2026-01-16 112330" src="https://github.com/user-attachments/assets/e3a850dd-083e-4b31-ba0f-a596fae23ed2" />

todo list page 
<img width="1888" height="695" alt="スクリーンショット 2026-01-16 112627" src="https://github.com/user-attachments/assets/b53e7fb7-aa85-4e85-abe4-54b7d1b8e151" />

scheduled task monitor
<img width="1893" height="809" alt="スクリーンショット 2026-01-16 112638" src="https://github.com/user-attachments/assets/9658457c-5ee0-4110-aaa8-9e38e4e51454" />

todolist edit 
<img width="1912" height="608" alt="スクリーンショット 2026-01-16 112653" src="https://github.com/user-attachments/assets/688cb04f-f571-49bc-87fb-b4508c816a67" />


scheduled task monitor socket connection for crontab log check
<img width="1865" height="887" alt="スクリーンショット 2026-01-16 112737" src="https://github.com/user-attachments/assets/35cc5946-61a3-4913-a70c-e75f925b9336" />





