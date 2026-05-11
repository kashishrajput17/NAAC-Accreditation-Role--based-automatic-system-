from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Criterion, KeyIndicator

criteria_bp = Blueprint("criteria", __name__)


@criteria_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_criteria():
    """Get all NAAC criteria along with their key indicators and metrics."""
    criteria = Criterion.query.order_by(Criterion.criterion_number).all()
    
    result = []
    for c in criteria:
        c_dict = c.to_dict()
        indicators = []
        for ki in c.key_indicators:
            ki_dict = ki.to_dict()
            metrics = [m.to_dict() for m in ki.metrics]
            ki_dict["metrics"] = metrics
            indicators.append(ki_dict)
        c_dict["key_indicators"] = indicators
        result.append(c_dict)

    return jsonify({"criteria": result}), 200


@criteria_bp.route("/<int:criterion_id>/indicators", methods=["GET"])
@jwt_required()
def get_indicators(criterion_id):
    """List key indicators under a specific criterion."""
    criterion = Criterion.query.get_or_404(criterion_id)
    indicators = [{"id": ki.id, "indicator_code": ki.indicator_code, "title": ki.title} for ki in criterion.key_indicators]
    return jsonify({"indicators": indicators}), 200


@criteria_bp.route("/<int:criterion_id>", methods=["GET"])
@jwt_required()
def get_criterion(criterion_id):
    """Get a single criterion with its key indicators."""
    criterion = Criterion.query.get_or_404(criterion_id)
    result = criterion.to_dict()
    result["key_indicators"] = []
    flat_metrics = []
    for ki in criterion.key_indicators:
        ki_dict = ki.to_dict()
        metrics = [m.to_dict() for m in ki.metrics]
        ki_dict["metrics"] = metrics
        result["key_indicators"].append(ki_dict)
        for m in metrics:
            m["key_indicator"] = ki.indicator_code
            m["name"] = m["title"]
            m["max_value"] = m["max_score"]
            m["status"] = "pending"
            m["value"] = None
        flat_metrics.extend(metrics)
    result["metrics"] = flat_metrics
    return jsonify({"criterion": result}), 200


@criteria_bp.route("/", methods=["POST"])
@jwt_required()
def create_criterion():
    """Create a new criterion."""
    data = request.get_json()

    if not data or not data.get("criterion_number") or not data.get("title"):
        return jsonify({"error": "criterion_number and title are required"}), 400

    if Criterion.query.filter_by(criterion_number=data["criterion_number"]).first():
        return jsonify({"error": f"Criterion {data['criterion_number']} already exists"}), 409

    criterion = Criterion(
        criterion_number=data["criterion_number"],
        title=data["title"],
        description=data.get("description", ""),
        weightage=data.get("weightage", 0.0),
    )

    db.session.add(criterion)
    db.session.commit()

    return jsonify({"message": "Criterion created", "criterion": criterion.to_dict()}), 201


@criteria_bp.route("/<int:criterion_id>", methods=["PUT"])
@jwt_required()
def update_criterion(criterion_id):
    """Update an existing criterion."""
    criterion = Criterion.query.get_or_404(criterion_id)
    data = request.get_json()

    if data.get("title"):
        criterion.title = data["title"]
    if data.get("description") is not None:
        criterion.description = data["description"]
    if data.get("weightage") is not None:
        criterion.weightage = data["weightage"]

    db.session.commit()

    return jsonify({"message": "Criterion updated", "criterion": criterion.to_dict()}), 200


@criteria_bp.route("/<int:criterion_id>", methods=["DELETE"])
@jwt_required()
def delete_criterion(criterion_id):
    """Delete a criterion and its associated key indicators."""
    criterion = Criterion.query.get_or_404(criterion_id)
    db.session.delete(criterion)
    db.session.commit()

    return jsonify({"message": "Criterion deleted"}), 200


# NOTE: Also mapping GET /api/indicators/<id>/metrics as requested
@criteria_bp.route("/indicators/<int:indicator_id>/metrics", methods=["GET"])
@jwt_required()
def get_metrics_by_indicator(indicator_id):
    """List metrics under a key indicator."""
    indicator = KeyIndicator.query.get_or_404(indicator_id)
    metrics = [m.to_dict() for m in indicator.metrics]
    return jsonify({"metrics": metrics}), 200
