"""Role-based access control decorators for Flask-JWT-Extended."""

from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User


def role_required(*allowed_roles):
    """
    Decorator that verifies JWT and checks if the user's role is authorized.

    Usage:
        @role_required('superadmin', 'iqac')
        def admin_only_route():
            ...

    Returns 403 Forbidden if the user's role is not in allowed_roles.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(int(current_user_id))

            if not user:
                return jsonify({"error": "User not found"}), 404

            if user.role not in allowed_roles:
                return jsonify({
                    "error": "Forbidden",
                    "message": f"Role '{user.role}' is not authorized. Required: {', '.join(allowed_roles)}",
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
