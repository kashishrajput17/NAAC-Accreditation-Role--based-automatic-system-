from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, AuditLog, MetricEntry, User

audit_bp = Blueprint("audit", __name__)

@audit_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_audit_logs():
    """
    Get paginated audit logs, visible only to iqac/superadmin.
    Supports filtering by table_name, record_id, user_id, from_date, to_date.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ("iqac", "superadmin"):
        return jsonify({"error": "Unauthorized"}), 403

    query = AuditLog.query

    table_name = request.args.get("table")
    if table_name:
        query = query.filter_by(table_name=table_name)
        
    record_id = request.args.get("record_id", type=int)
    if record_id:
        query = query.filter_by(record_id=record_id)
        
    filter_user_id = request.args.get("user_id", type=int)
    if filter_user_id:
        query = query.filter_by(user_id=filter_user_id)

    from_date = request.args.get("from_date")
    if from_date:
        query = query.filter(AuditLog.timestamp >= from_date)
        
    to_date = request.args.get("to_date")
    if to_date:
        query = query.filter(AuditLog.timestamp <= to_date)

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    pagination = query.order_by(AuditLog.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    logs = []
    for log in pagination.items:
        log_dict = log.to_dict()
        u = User.query.get(log.user_id)
        log_dict["user_name"] = u.name if u else "Unknown"
        logs.append(log_dict)

    return jsonify({
        "logs": logs,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page
    }), 200

@audit_bp.route("/metrics/entry/<int:entry_id>/history", methods=["GET"])
@jwt_required()
def get_metric_entry_history(entry_id):
    """
    Return all versions of a metric entry sorted by DESC timestamp.
    """
    # This queries the AuditLog specifically for metric_entries
    logs = AuditLog.query.filter_by(
        table_name="metric_entries",
        record_id=entry_id
    ).order_by(AuditLog.timestamp.desc()).all()
    
    history = []
    for log in logs:
        u = User.query.get(log.user_id)
        history.append({
            "id": log.id,
            "action": log.action,
            "timestamp": log.timestamp.isoformat(),
            "user_name": u.name if u else "Unknown",
            "user_role": u.role if u else "Unknown",
            "old_value": log.old_value,
            "new_value": log.new_value
        })
        
    # Let's also include the current active state
    entry = MetricEntry.query.get_or_404(entry_id)
    
    return jsonify({
        "entry": entry.to_dict(),
        "history": history
    }), 200
