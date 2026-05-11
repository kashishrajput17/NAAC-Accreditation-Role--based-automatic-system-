from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt,
)
from models import db, User, TokenBlocklist

auth_bp = Blueprint("auth", __name__)

# Roles that only a superadmin can assign during registration
PRIVILEGED_ROLES = {"superadmin", "iqac", "dean", "vice_chancellor"}


# ──────────────────────────────────────────────
# POST /api/auth/register
# ──────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new user.
    - Anyone can self-register as 'faculty' or 'hod'.
    - Only a superadmin can register users with privileged roles.
    """
    data = request.get_json()

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "name, email, and password are required"}), 400

    requested_role = data.get("role", "faculty")

    # Guard privileged roles — require a logged-in superadmin
    if requested_role in PRIVILEGED_ROLES:
        from flask_jwt_extended import verify_jwt_in_request
        try:
            verify_jwt_in_request()
            caller_id = get_jwt_identity()
            caller = User.query.get(int(caller_id))
            if not caller or caller.role != "superadmin":
                return jsonify({
                    "error": "Forbidden",
                    "message": f"Only superadmin can register users with role '{requested_role}'",
                }), 403
        except Exception:
            return jsonify({
                "error": "Forbidden",
                "message": f"Authentication required to register role '{requested_role}'",
            }), 403

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        name=data["name"],
        email=data["email"],
        role=requested_role,
        school=data.get("school"),
        department=data.get("department"),
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    # Issue tokens so the user is logged in immediately
    additional_claims = {"role": user.role, "name": user.name}
    access_token = create_access_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "User registered successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 201


# ──────────────────────────────────────────────
# POST /api/auth/login
# ──────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate user and return JWT tokens with role embedded in claims."""
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    additional_claims = {"role": user.role, "name": user.name}
    access_token = create_access_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict(),
    }), 200


# ──────────────────────────────────────────────
# GET /api/auth/me
# ──────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Return current user profile with role and permissions."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Build a permissions map based on role
    permissions = _get_permissions(user.role)

    return jsonify({
        "user": user.to_dict(),
        "permissions": permissions,
    }), 200


# ──────────────────────────────────────────────
# POST /api/auth/logout
# ──────────────────────────────────────────────
@auth_bp.route("/logout", methods=["POST"])
@jwt_required(verify_type=False)
def logout():
    """Invalidate the current token by adding its JTI to the blocklist."""
    jwt_data = get_jwt()
    jti = jwt_data["jti"]
    token_type = jwt_data["type"]
    current_user_id = get_jwt_identity()

    blocked = TokenBlocklist(
        jti=jti,
        token_type=token_type,
        user_id=int(current_user_id),
    )
    db.session.add(blocked)
    db.session.commit()

    return jsonify({"message": f"{token_type.capitalize()} token revoked"}), 200


# ──────────────────────────────────────────────
# POST /api/auth/refresh
# ──────────────────────────────────────────────
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh the access token."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))

    if not user:
        return jsonify({"error": "User not found"}), 404

    additional_claims = {"role": user.role, "name": user.name}
    new_access_token = create_access_token(
        identity=current_user_id, additional_claims=additional_claims
    )

    return jsonify({"access_token": new_access_token}), 200


# ──────────────────────────────────────────────
# Helper: role → permissions mapping
# ──────────────────────────────────────────────
def _get_permissions(role):
    """Return a dict of permission flags for a given role."""
    base = {
        "can_view_dashboard": True,
        "can_submit_data": False,
        "can_review_data": False,
        "can_manage_users": False,
        "can_manage_criteria": False,
        "can_generate_reports": False,
        "can_approve_scores": False,
    }

    if role == "faculty":
        base["can_submit_data"] = True

    elif role == "hod":
        base["can_submit_data"] = True
        base["can_review_data"] = True

    elif role == "dean":
        base["can_submit_data"] = True
        base["can_review_data"] = True
        base["can_generate_reports"] = True

    elif role == "iqac":
        base["can_submit_data"] = True
        base["can_review_data"] = True
        base["can_manage_criteria"] = True
        base["can_generate_reports"] = True
        base["can_approve_scores"] = True

    elif role == "vice_chancellor":
        base["can_review_data"] = True
        base["can_generate_reports"] = True
        base["can_approve_scores"] = True

    elif role == "superadmin":
        base = {k: True for k in base}

    return base
