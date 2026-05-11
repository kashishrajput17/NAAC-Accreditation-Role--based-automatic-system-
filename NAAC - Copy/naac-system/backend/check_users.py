from app import create_app
from models import User, db

app = create_app()
with app.app_context():
    users = User.query.order_by(User.id.desc()).limit(5).all()
    for u in users:
        print(f"ID: {u.id}, Email: {u.email}, Created: {u.created_at}")
