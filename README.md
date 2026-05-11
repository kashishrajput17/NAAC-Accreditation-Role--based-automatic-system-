<<<<<<< HEAD
# NAAC Accreditation Automation System

A full-stack web application for automating NAAC accreditation processes, including criteria management, metrics tracking, scoring, and report generation.

## Tech Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Frontend | React 18, React Router v6, Axios, Recharts, Tailwind CSS |
| Backend  | Python Flask, Flask-CORS, Flask-JWT-Extended, Flask-SQLAlchemy |
| Database | SQLite (`naac.db`)                                |
| Build    | Vite                                              |

---

## Project Structure

```
naac-system/
├── backend/
│   ├── app.py                # Flask application factory
│   ├── config.py             # Configuration (JWT, DB)
│   ├── models.py             # SQLAlchemy models
│   ├── routes/
│   │   ├── auth.py           # Authentication endpoints
│   │   ├── criteria.py       # NAAC criteria CRUD
│   │   ├── metrics.py        # Metrics CRUD + stats
│   │   ├── reports.py        # Report generation
│   │   └── users.py          # User management
│   ├── utils/
│   │   ├── scoring.py        # NAAC scoring & grading
│   │   └── validators.py     # Input validation
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── context/          # Auth context provider
│   │   ├── utils/            # API client & helpers
│   │   └── assets/           # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .env                      # Environment variables
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**

### 1. Clone and Configure

```bash
cd naac-system
# Edit .env with your own JWT secret
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The Flask API server starts at **http://localhost:5000**.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React dev server starts at **http://localhost:3000** and proxies `/api` requests to the Flask backend.

---

## API Endpoints

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/auth/register`   | Register a new user      |
| POST   | `/api/auth/login`      | Login and get JWT tokens |
| POST   | `/api/auth/refresh`    | Refresh access token     |
| GET    | `/api/auth/me`         | Current user profile     |
| GET    | `/api/criteria`        | List all criteria        |
| POST   | `/api/criteria`        | Create a criterion       |
| GET    | `/api/criteria/:id`    | Get criterion + metrics  |
| PUT    | `/api/criteria/:id`    | Update a criterion       |
| DELETE | `/api/criteria/:id`    | Delete a criterion       |
| GET    | `/api/metrics`         | List metrics (filterable)|
| POST   | `/api/metrics`         | Create a metric          |
| PUT    | `/api/metrics/:id`     | Update a metric          |
| DELETE | `/api/metrics/:id`     | Delete a metric          |
| GET    | `/api/metrics/stats`   | Metric statistics        |
| GET    | `/api/reports`         | List all reports         |
| POST   | `/api/reports/generate`| Generate a new report    |
| PUT    | `/api/reports/:id`     | Update report status     |
| DELETE | `/api/reports/:id`     | Delete a report          |
| GET    | `/api/users`           | List all users           |
| PUT    | `/api/users/:id`       | Update user details      |
| DELETE | `/api/users/:id`       | Delete a user            |

---

## NAAC Grading Scale

| CGPA Range | Grade |
|------------|-------|
| 3.76 – 4.00| A++  |
| 3.51 – 3.75| A+   |
| 3.01 – 3.50| A    |
| 2.76 – 3.00| B++  |
| 2.51 – 2.75| B+   |
| 2.01 – 2.50| B    |
| 1.51 – 2.00| C    |
| ≤ 1.50     | D    |
=======
# NAAC-Accreditation-Role--based-automatic-system-
>>>>>>> 7921d1605b3771d7bbfb8177e78d0caa12cd8fc7
