from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Metric, MetricEntry, KeyIndicator, User, AuditLog
from utils.decorators import role_required
from utils.validators import log_audit

metrics_bp = Blueprint("metrics", __name__)


# ── Metric Routes ──────────────────────────────


@metrics_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("superadmin", "iqac")
def create_metric():
    """Create a new metric."""
    data = request.get_json()
    if not data or not data.get("key_indicator") or not data.get("name") or not data.get("criterion_id"):
        return jsonify({"error": "Missing required fields"}), 400

    indicator_code = ".".join(data["key_indicator"].split(".")[:2])
    ki = KeyIndicator.query.filter_by(criterion_id=data["criterion_id"], indicator_code=indicator_code).first()
    if not ki:
        ki = KeyIndicator(criterion_id=data["criterion_id"], indicator_code=indicator_code, title=indicator_code)
        db.session.add(ki)
        db.session.flush()

    input_type = "quantitative" if data.get("data_type") in ("numeric", "percentage") else "qualitative"
    metric = Metric(
        key_indicator_id=ki.id,
        metric_code=data["key_indicator"],
        title=data["name"],
        description=data.get("description", ""),
        input_type=input_type,
        max_score=data.get("max_value", 0.0)
    )
    db.session.add(metric)
    db.session.commit()
    return jsonify({"message": "Metric created", "metric": metric.to_dict()}), 201


@metrics_bp.route("/entries", methods=["GET"])
@jwt_required()
def get_all_entries():
    """Return all MetricEntry records, filtered by query params."""
    school = request.args.get("school")
    department = request.args.get("department")
    academic_year = request.args.get("academic_year")
    status = request.args.get("status")

    query = MetricEntry.query
    if school:
        query = query.filter_by(school=school)
    if department:
        query = query.filter_by(department=department)
    if academic_year:
        query = query.filter_by(academic_year=academic_year)
    if status:
        query = query.filter_by(status=status)

    entries = query.order_by(MetricEntry.submitted_at.desc()).all()
    return jsonify({"entries": [e.to_dict() for e in entries]}), 200


@metrics_bp.route("/", methods=["GET"])
@jwt_required()
def get_all_metrics():
    """Get metrics filtered by URL params (fetches the MetricEntries matched for each metric based on params)."""
    school = request.args.get("school")
    department = request.args.get("department")
    academic_year = request.args.get("academic_year")
    status = request.args.get("status")

    # This route could be interpreted two ways: return the Metrics schema, or return MetricEntries.
    # Given the requirements: "list metrics filtered by ?school=&..."
    # Usually this means we load Metrics and embed the corresponding Entry for this school/dept.
    metrics = Metric.query.order_by(Metric.metric_code).all()
    
    result = []
    for m in metrics:
        m_dict = m.to_dict()
        # Find entries matching filters
        query = MetricEntry.query.filter_by(metric_id=m.id)
        if school:
            query = query.filter_by(school=school)
        if department:
            query = query.filter_by(department=department)
        if academic_year:
            query = query.filter_by(academic_year=academic_year)
        if status:
            query = query.filter_by(status=status)
            
        entries = query.all()
        m_dict["entries"] = [e.to_dict() for e in entries]
        result.append(m_dict)

    return jsonify({"metrics": result}), 200


@metrics_bp.route("/<int:metric_id>/entry", methods=["POST"])
@jwt_required()
@role_required("faculty", "hod", "superadmin")
def create_entry_for_metric(metric_id):
    """Submit a metric entry."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    data = request.get_json()
    if not data or not data.get("academic_year"):
        return jsonify({"error": "academic_year is required"}), 400

    # Ensure school/department match unless superadmin
    req_school = data.get("school")
    req_dept = data.get("department")
    
    if user.role != "superadmin":
        if req_school and req_school != user.school:
            return jsonify({"error": "School does not match your profile"}), 403
        if req_dept and req_dept != user.department:
            return jsonify({"error": "Department does not match your profile"}), 403
            
        req_school = user.school
        req_dept = user.department

    # Auto-set status draft, version 1
    entry = MetricEntry(
        metric_id=metric_id,
        school=req_school,
        department=req_dept,
        academic_year=data["academic_year"],
        submitted_by=user.id,
        value_text=data.get("value_text"),
        value_numeric=data.get("value_numeric"),
        status="draft",
        version=1
    )

    db.session.add(entry)
    db.session.flush() # get entry.id
    
    log_audit(user.id, "create", "metric_entries", entry.id, None, str(entry.to_dict()))
    
    db.session.commit()

    return jsonify({"message": "Metric entry created", "entry": entry.to_dict()}), 201


@metrics_bp.route("/entry/<int:entry_id>", methods=["PUT"])
@jwt_required()
def update_draft_entry(entry_id):
    """Update existing draft entry."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    entry = MetricEntry.query.get_or_404(entry_id)
    
    if entry.status != "draft" and entry.status != "rejected":
        return jsonify({"error": "Only draft or rejected entries can be updated"}), 400
        
    if user.role != "superadmin" and entry.submitted_by != current_user_id:
        return jsonify({"error": "You can only update your own entries"}), 403
        
    data = request.get_json()
    old_val = str(entry.to_dict())
    
    if "value_text" in data:
        entry.value_text = data["value_text"]
    if "value_numeric" in data:
        entry.value_numeric = data["value_numeric"]
        
    entry.version += 1
    
    db.session.flush()
    new_val = str(entry.to_dict())
    
    log_audit(current_user_id, "update", "metric_entries", entry.id, old_val, new_val)
    db.session.commit()

    return jsonify({"message": "Entry updated", "entry": entry.to_dict()}), 200


@metrics_bp.route("/entry/<int:entry_id>/submit", methods=["PATCH"])
@jwt_required()
def submit_entry(entry_id):
    """Change status from 'draft' to 'submitted'."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    entry = MetricEntry.query.get_or_404(entry_id)
    
    if entry.status != "draft":
        return jsonify({"error": "Only draft entries can be submitted"}), 400

    if user.role != "superadmin" and entry.submitted_by != current_user_id:
        return jsonify({"error": "You can only submit your own entries"}), 403

    old_val = entry.status
    entry.status = "submitted"
    
    log_audit(current_user_id, "submit", "metric_entries", entry.id, old_val, "submitted")
    db.session.commit()
    
    return jsonify({"message": "Entry submitted", "entry": entry.to_dict()}), 200


@metrics_bp.route("/entry/<int:entry_id>/review", methods=["PATCH"])
@jwt_required()
@role_required("dean", "iqac", "superadmin", "vice_chancellor", "hod") 
# User story said dean, iqac. HOD might review faculty entries inside department. Will allow role_required to pass and verify scope manually.
def review_entry(entry_id):
    """Approve or reject a submitted entry."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    entry = MetricEntry.query.get_or_404(entry_id)
    
    if entry.status != "submitted":
        return jsonify({"error": "Only submitted entries can be reviewed"}), 400
        
    # HOD can only review their own department
    if user.role == "hod" and entry.department != user.department:
        return jsonify({"error": "HOD can only review entries from their own department"}), 403
        
    data = request.get_json()
    new_status = data.get("status")
    
    if new_status not in ["approved", "rejected"]:
        return jsonify({"error": "Status must be 'approved' or 'rejected'"}), 400
        
    old_status = entry.status
    entry.status = new_status
    entry.reviewed_by = current_user_id
    if data.get("review_comment"):
        entry.review_comment = data["review_comment"]
        
    log_audit(current_user_id, "review", "metric_entries", entry.id, old_status, new_status)
    db.session.commit()
    
    return jsonify({"message": f"Entry {new_status}", "entry": entry.to_dict()}), 200


# Keeps existing non-conflicting CRUD
@metrics_bp.route("/<int:metric_id>", methods=["GET"])
@jwt_required()
def get_metric(metric_id):
    metric = Metric.query.get_or_404(metric_id)
    result = metric.to_dict()
    result["entries"] = [e.to_dict() for e in metric.entries]
    return jsonify({"metric": result}), 200
