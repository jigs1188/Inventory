# Inventory & Order Management System

A full-stack, containerized Inventory and Order Management System built with **React (Next.js)**, **Python (FastAPI)**, and **PostgreSQL**. This application provides a complete dashboard to manage products, customers, and orders, while securely handling authentication and real-time stock tracking.

## Features

- **JWT Authentication**: Secure login and registration flows with password hashing (bcrypt).
- **Product Management**: Add, update, and track products with live stock quantity tracking and low-stock alerts.
- **Customer Management**: Maintain a database of customers for order fulfillment.
- **Order Management**: Create orders linking customers and products. Automatic, transaction-safe inventory reduction.
- **Analytics Dashboard**: View aggregate business metrics, active system status, and inventory health.
- **Modern UI**: Fully responsive, accessible, and fast interface built with Tailwind CSS and standard React components.
- **Dockerized**: Fully containerized backend, frontend, and database services orchestrated via `docker-compose`.

## Technology Stack

### Frontend

### DevOps
- **Docker**: Containerization
- **docker-compose**: Multi-container orchestration

## Project Structure

```
.
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routes/            # API endpoints
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── database/          # Database configuration
│   │   └── main.py            # Application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile             # Backend container
│   └── .env.example           # Environment variables template
├── app/                       # Next.js application
│   └── page.tsx               # Main page
├── components/                # React components
│   ├── navigation.tsx
│   ├── dashboard.tsx
│   ├── products-page.tsx
│   ├── customers-page.tsx
│   └── orders-page.tsx
├── Dockerfile                 # Frontend container
├── docker-compose.yml         # Multi-container setup
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- Docker and docker-compose (optional)

### Local Development

#### Option 1: Using Docker (Recommended)

1. Start all services:
```bash
docker-compose up
```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

#### Option 2: Manual Setup

**Backend Setup:**

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables (optional, defaults to SQLite):
```bash
cp .env.example .env
# Edit .env with your database configuration
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

**Frontend Setup:**

1. In a new terminal, install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

The frontend will be available at http://localhost:3000

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/{id}` - Update a customer
- `DELETE /api/customers/{id}` - Delete a customer

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create a new order (with inventory validation)
- `PUT /api/orders/{id}` - Update order status
- `DELETE /api/orders/{id}` - Cancel an order (restores inventory)

## Database Schema

### Products Table
- `id` (Integer, Primary Key)
- `sku` (String, Unique) - Product SKU
- `name` (String) - Product name
- `description` (String, Optional)
- `price` (Float) - Product price
- `stock_quantity` (Integer) - Available stock
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

### Customers Table
- `id` (Integer, Primary Key)
- `name` (String) - Customer name
- `email` (String, Unique) - Customer email
- `phone` (String, Optional)
- `address` (String, Optional)
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

### Orders Table
- `id` (Integer, Primary Key)
- `customer_id` (Integer, Foreign Key) - Reference to customer
- `order_number` (String, Unique) - Order identifier
- `status` (String) - Order status (pending, confirmed, shipped, delivered, cancelled)
- `total_amount` (Float) - Order total
- `created_at` (DateTime) - Creation timestamp
- `updated_at` (DateTime) - Last update timestamp

### Order Items Table
- `id` (Integer, Primary Key)
- `order_id` (Integer, Foreign Key) - Reference to order
- `product_id` (Integer, Foreign Key) - Reference to product
- `quantity` (Integer) - Item quantity
- `unit_price` (Float) - Price at time of order
- `subtotal` (Float) - Line total

## Key Features Implementation

### Transaction-Safe Order Creation
When creating an order, the system:
1. Validates the customer exists
2. Checks all products are available
3. Verifies sufficient stock for each item
4. Only commits if all validations pass
5. Automatically reduces stock on order confirmation
6. Restores stock if order is cancelled

### Unique Constraints
- Product SKU must be unique
- Customer email must be unique
- Order number is auto-generated and unique

### Error Handling
- Duplicate SKU/email validation
- Insufficient stock detection
- Invalid data type handling
- Proper HTTP status codes and error messages

## Deployment

### Deploy to Render (Backend)
1. Create a Render account and connect your GitHub repository
2. Create a new Web Service with Python environment
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Add environment variable: `DATABASE_URL` (PostgreSQL connection string)

### Deploy to Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL` (backend API URL)
3. Deploy automatically on git push

### Database Options
- **Development**: SQLite (included, no setup needed)
- **Production**: Neon, Supabase, or AWS RDS PostgreSQL

## Development Tips

### Adding a New Product
1. Fill in the product form on the Products page
2. SKU must be unique
3. Stock quantity cannot be negative

### Creating an Order
1. Select a customer from the dropdown
2. Add items with product selection and quantity
3. System validates stock availability before confirming
4. Order status is set to "confirmed" on creation

### Monitoring Stock
- Dashboard shows count of products with stock < 10
- Products page highlights low-stock items in red
- Order creation prevents overselling

## Contributing

This is a demonstration of a full-stack inventory management system. Feel free to extend it with:
- User authentication
- Order shipment tracking
- Product categories and filtering
- Inventory analytics and reports
- Email notifications
- Multi-user role management

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please create an issue in the repository.
