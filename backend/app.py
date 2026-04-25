from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from models import db, init_db, TokenBlocklist

# Import route blueprints
from routes.auth import auth_bp
from routes.criteria import criteria_bp
from routes.metrics import metrics_bp
from routes.scores import scores_bp
from routes.users import users_bp
from routes.audit import audit_bp
from routes.reports import reports_bp


def create_app(config_class=Config):
    """Application factory for the Flask app."""
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app)
    jwt = JWTManager(app)
    db.init_app(app)

    # ── JWT blocklist check callback ──────────
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(_jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None

    @jwt.revoked_token_loader
    def revoked_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"error": "Token has been revoked"}), 401

    @jwt.expired_token_loader
    def expired_token_callback(_jwt_header, _jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({"error": "Invalid token", "message": error_string}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({"error": "Authorization required", "message": error_string}), 401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(criteria_bp, url_prefix="/api/criteria")
    app.register_blueprint(metrics_bp, url_prefix="/api/metrics")
    app.register_blueprint(scores_bp, url_prefix="/api/scores")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(audit_bp, url_prefix="/api/audit")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    # Create database tables and seed data
    init_db(app)

    @app.route("/api/health")
    def health_check():
        return {"status": "healthy", "message": "NAAC Accreditation API is running"}

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error.description)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized", "message": str(error.description)}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "message": "Access Denied"}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
