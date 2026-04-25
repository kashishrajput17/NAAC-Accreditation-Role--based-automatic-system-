from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, AuditLog
from utils.validators import log_audit
from utils.decorators import role_required

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("superadmin")
def get_all_users():
    """Get all active users, optionally filtered by role, school, or department."""
    role = request.args.get("role")
    school = request.args.get("school")
    department = request.args.get("department")

    query = User.query.filter_by(is_active=True)
    if role:
        query = query.filter_by(role=role)
    if school:
        query = query.filter_by(school=school)
    if department:
        query = query.filter_by(department=department)

    users = query.order_by(User.created_at.desc()).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200


@users_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("superadmin")
def create_user():
    """Create a new user."""
    current_uid = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get("email") or not data.get("name") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "Email already exists"}), 400

    user = User(
        name=data["name"],
        email=data["email"],
        role=data.get("role", "faculty"),
        school=data.get("school"),
        department=data.get("department")
    )
    user.set_password(data["password"])
    
    db.session.add(user)
    db.session.flush()
    log_audit(int(current_uid), "create", "users", user.id, None, user.to_dict())
    db.session.commit()
    
    return jsonify({"message": "User created", "user": user.to_dict()}), 201


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    """Get a single user by ID."""
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()}), 200


@users_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
@role_required("superadmin")
def update_user(user_id):
    """Update user details."""
    current_uid = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    old_val = user.to_dict()
    data = request.get_json()

    if data.get("name"):
        user.name = data["name"]
    if data.get("email"):
        user.email = data["email"]
    if data.get("role"):
        user.role = data["role"]
    if "school" in data:
        user.school = data["school"]
    if "department" in data:
        user.department = data["department"]
    if data.get("password"):
        user.set_password(data["password"])

    db.session.flush()
    new_val = user.to_dict()
    log_audit(int(current_uid), "update", "users", user.id, old_val, new_val)
    db.session.commit()

    return jsonify({"message": "User updated", "user": user.to_dict()}), 200


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
@role_required("superadmin")
def delete_user(user_id):
    """Soft delete a user."""
    current_uid = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    old_val = user.to_dict()
    
    user.is_active = False
    
    db.session.flush()
    new_val = user.to_dict()
    log_audit(int(current_uid), "delete", "users", user.id, old_val, new_val)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200


@users_bp.route("/<int:user_id>/activity", methods=["GET"])
@jwt_required()
@role_required("superadmin")
def get_user_activity(user_id):
    """Fetch audit logs for a specific user's actions."""
    logs = AuditLog.query.filter_by(user_id=user_id).order_by(AuditLog.timestamp.desc()).all()
    user = User.query.get_or_404(user_id)
    
    return jsonify({
        "user": user.to_dict(),
        "activity": [log.to_dict() for log in logs]
    }), 200

@users_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Allows a user to change their password."""
    current_uid = get_jwt_identity()
    user = User.query.get_or_404(current_uid)
    data = request.get_json()
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"error": "Missing required fields"}), 400
        
    if not user.check_password(current_password):
        return jsonify({"error": "Invalid current password"}), 401
        
    user.set_password(new_password)
    
    old_val = user.to_dict()
    old_val["password_hash"] = "***"  # Obscure
    db.session.flush()
    new_val = user.to_dict()
    new_val["password_hash"] = "***"
    
    log_audit(int(current_uid), "update_password", "users", user.id, old_val, new_val)
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200
