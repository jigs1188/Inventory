# Inventory & Order Management System

A full-stack Inventory and Order Management System built with **React (Next.js)**, **Python (FastAPI)**, and **PostgreSQL**. It provides a responsive dashboard for managing products, customers, and orders, with secure JWT authentication, real-time stock tracking, and transaction-safe order processing.

**Live Application:** [https://inventory-cyan-theta.vercel.app](https://inventory-cyan-theta.vercel.app)
**Backend API Docs:** [https://inventory-api-backend.onrender.com/docs](https://inventory-api-backend.onrender.com/docs)

---

## Features

- **JWT Authentication** — Secure register and login with bcrypt password hashing.
- **Product Management** — Add, edit, and delete products with unique SKU enforcement and low-stock alerts.
- **Customer Management** — Maintain a customer database with unique email validation.
- **Order Management** — Create orders with automatic inventory deduction; cancelling an order restores stock.
- **Inventory Validation** — Orders cannot be placed if stock is insufficient. Stock quantity must always be at least 1 on product creation.
- **Analytics Dashboard** — Real-time aggregate metrics showing total products, customers, orders, and low-stock alerts.
- **Containerized** — Backend, frontend, and database services are fully containerized using Docker and Docker Compose.
- **Hosted on Free Tier** — Frontend on Vercel, Backend on Render, Database on Neon (PostgreSQL).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Database | PostgreSQL (Neon in production, SQLite for local dev) |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Containerization | Docker, Docker Compose |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

---

## Project Structure

```
inventory-order-system/
├── backend/
│   ├── app/
│   │   ├── core/              # Security, JWT, and auth dependencies
│   │   ├── database/          # SQLAlchemy engine and session config
│   │   ├── models/            # Database models (Product, Customer, Order)
│   │   ├── routes/            # API route handlers (auth, products, customers, orders)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── main.py            # FastAPI application entry point
│   ├── Dockerfile             # Backend Docker image
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── page.tsx           # Main app shell (SPA routing)
│   ├── components/
│   │   ├── dashboard.tsx      # Analytics dashboard
│   │   ├── products-page.tsx  # Product management UI
│   │   ├── customers-page.tsx # Customer management UI
│   │   ├── orders-page.tsx    # Order management UI
│   │   └── navigation.tsx     # Sidebar navigation
│   ├── lib/
│   │   └── auth.ts            # JWT token utilities and authenticated fetch helper
│   ├── Dockerfile             # Frontend Docker image
│   └── package.json
├── docker-compose.yml         # Multi-service orchestration
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker Desktop (optional, for containerized setup)

### Option 1: Run with Docker Compose (All services at once)

Make sure Docker Desktop is running, then from the project root:

```bash
docker-compose up
```

This starts three services automatically:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8000
- **PostgreSQL Database** → port 5432

### Option 2: Run Manually (without Docker)

**Backend:**

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload
```

Backend runs at http://localhost:8000 — uses SQLite automatically if no `DATABASE_URL` is set.

**Frontend:**

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at http://localhost:3000

---

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | SQLite fallback |
| `SECRET_KEY` | Secret key for JWT signing | Change in production |

### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API (e.g. https://your-backend.onrender.com) |

---

## API Reference

All endpoints (except `/api/auth/*` and `/health`) require a Bearer token in the `Authorization` header.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Get current logged-in user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create a product (SKU must be unique, qty ≥ 1) |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create a customer (email must be unique) |
| PUT | `/api/customers/{id}` | Update a customer |
| DELETE | `/api/customers/{id}` | Delete a customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create an order (validates stock) |
| PUT | `/api/orders/{id}` | Update order status |
| DELETE | `/api/orders/{id}` | Cancel an order (restores stock) |

Full interactive API docs available at `/docs` on the backend URL.

---

## Database Schema

### products
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| sku | String | Unique |
| name | String | |
| description | String | Optional |
| price | Float | |
| stock_quantity | Integer | Must be ≥ 1 |
| created_at | DateTime | |
| updated_at | DateTime | |

### customers
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| name | String | |
| email | String | Unique |
| phone | String | Optional |
| address | String | Optional |
| created_at | DateTime | |
| updated_at | DateTime | |

### orders
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| customer_id | Integer | Foreign Key → customers |
| order_number | String | Auto-generated, Unique |
| status | String | pending / confirmed / shipped / delivered / cancelled |
| total_amount | Float | |
| created_at | DateTime | |
| updated_at | DateTime | |

### order_items
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key |
| order_id | Integer | Foreign Key → orders |
| product_id | Integer | Foreign Key → products |
| quantity | Integer | |
| unit_price | Float | Price captured at time of order |
| subtotal | Float | unit_price × quantity |

---

## Business Rules

1. **Unique Product SKU** — The system rejects duplicate SKUs at both the API and database level.
2. **Unique Customer Email** — Each customer must have a distinct email address.
3. **Inventory Validation** — When placing an order, the backend checks each item's requested quantity against the available stock. If any product has insufficient stock, the entire order is rejected with a clear error message.
4. **Atomic Stock Reduction** — Order creation uses a database transaction. Stock is only reduced after all items are validated. If anything fails mid-way, the transaction rolls back completely.
5. **Stock Restoration on Cancellation** — Cancelling an order automatically restores the quantity for every product in that order.
6. **Minimum Stock on Create** — Products cannot be created with a stock quantity of 0 or less.

---

## License

This project is open source and available under the MIT License.
