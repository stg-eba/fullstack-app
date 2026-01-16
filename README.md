The application is designed to demonstrate proficiency in Node.js backend development, database management with PostgreSQL, and full-stack integration.

Key Features Implemented
API Development:

RESTful endpoints for managing a To-Do List (CRUD operations).

Built with Express.js.

Database Operations:

PostgreSQL used as the primary relational database.

ORM implementation using Sequelize.

Models defined for User, Todo, ScheduledTask, and TaskLog.

Security Implementation:

JWT (JSON Web Tokens) for secure, stateless authentication.

HttpOnly Cookies to prevent XSS attacks on token storage.

Bcrypt for password hashing.

CORS configuration to securely allow frontend communication (Port 4000).

Scheduled Task Management:

Automated batch processing using node-cron (via scheduler).

API endpoints to view scheduled tasks and their execution logs.

Real-time Infrastructure:

Socket.io integrated into the HTTP server to support real-time features (e.g., task updates or chat foundations).
