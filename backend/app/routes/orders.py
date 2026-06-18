from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from app.database.config import get_db
from app.core import deps
from app.models.inventory import Order, OrderItem, Product, Customer
from app.schemas.inventory import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    OrderDetailResponse,
)

router = APIRouter(prefix="/api/orders", tags=["orders"], dependencies=[Depends(deps.get_current_active_user)])


def generate_order_number(db: Session) -> str:
    """Generate a unique order number"""
    last_order = db.query(Order).order_by(desc(Order.id)).first()
    order_num = (last_order.id + 1) if last_order else 1
    return f"ORD-{order_num:06d}"


@router.get("", response_model=list[OrderDetailResponse])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(Order).offset(skip).limit(limit).all()
    return orders


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order with inventory validation.
    Transaction-safe: rolls back if any item fails validation.
    """
    # Verify customer exists
    customer = db.query(Customer).filter(Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Validate all products and check stock availability
    order_items_data = []
    total_amount = 0.0

    try:
        for item in order.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()

            if not product:
                raise ValueError(f"Product {item.product_id} not found")

            if item.quantity <= 0:
                raise ValueError("Item quantity must be positive")

            if product.stock_quantity < item.quantity:
                raise ValueError(
                    f"Insufficient stock for product {product.sku}. "
                    f"Available: {product.stock_quantity}, Requested: {item.quantity}"
                )

            order_items_data.append(
                {
                    "product": product,
                    "quantity": item.quantity,
                    "unit_price": product.price,
                    "subtotal": product.price * item.quantity,
                }
            )
            total_amount += product.price * item.quantity

        # All validations passed, create the order
        order_number = generate_order_number(db)

        db_order = Order(
            customer_id=order.customer_id,
            order_number=order_number,
            status="confirmed",
            total_amount=total_amount,
        )
        db.add(db_order)
        db.flush()  # Get the order ID

        # Create order items and reduce stock
        for item_data in order_items_data:
            product = item_data["product"]
            quantity = item_data["quantity"]

            # Reduce stock
            product.stock_quantity -= quantity
            db.add(product)

            # Create order item
            order_item = OrderItem(
                order_id=db_order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=item_data["unit_price"],
                subtotal=item_data["subtotal"],
            )
            db.add(order_item)

        db.commit()
        db.refresh(db_order)
        return db_order

    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error creating order")


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int, order: OrderUpdate, db: Session = Depends(get_db)
):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status:
        db_order.status = order.status

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/{order_id}")
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    """
    Cancel an order and restore inventory.
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if db_order.status == "cancelled":
        raise HTTPException(status_code=400, detail="Order already cancelled")

    try:
        # Restore inventory for each item
        for item in db_order.order_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                product.stock_quantity += item.quantity
                db.add(product)

        db_order.status = "cancelled"
        db.add(db_order)
        db.commit()

        return {"message": "Order cancelled successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error cancelling order")
