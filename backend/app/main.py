from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.config import Base, engine
from app.routes import products, customers, orders, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management API",
    description="API for managing products, customers, and orders",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
