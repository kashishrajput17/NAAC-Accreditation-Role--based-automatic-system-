"""Input validation utilities for the NAAC API."""

import re
import json
from models import db, AuditLog

def log_audit(user_id, action, table_name, record_id, old_value=None, new_value=None):
    """Log actions to AuditLog table."""
    o_val = json.dumps(old_value) if isinstance(old_value, dict) else str(old_value) if old_value is not None else None
    n_val = json.dumps(new_value) if isinstance(new_value, dict) else str(new_value) if new_value is not None else None
    
    log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=o_val,
        new_value=n_val
    )
    db.session.add(log)


def validate_email(email):
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password(password):
    """
    Validate password strength.

    Returns:
        Tuple of (is_valid, error_message).
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit"
    return True, None


def validate_role(role):
    """Validate that the role is one of the allowed values."""
    allowed_roles = ("admin", "coordinator", "viewer")
    return role in allowed_roles


def validate_criterion_number(number):
    """Validate criterion number (1-7 for NAAC)."""
    return isinstance(number, int) and 1 <= number <= 7


def validate_metric_status(status):
    """Validate metric status value."""
    allowed_statuses = ("pending", "in_progress", "completed", "verified")
    return status in allowed_statuses


def sanitize_string(value, max_length=500):
    """Sanitize a string input by stripping and truncating."""
    if not isinstance(value, str):
        return ""
    return value.strip()[:max_length]
