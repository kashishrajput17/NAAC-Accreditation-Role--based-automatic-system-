from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# ──────────────────────────────────────────────
# 1. User
# ──────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True)
    role = db.Column(
        db.Enum('superadmin', 'iqac', 'dean', 'hod', 'faculty', 'vice_chancellor',
                name='user_role'),
        nullable=False, default='faculty'
    )
    school = db.Column(db.String(150), nullable=True)
    department = db.Column(db.String(150), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    submitted_entries = db.relationship(
        "MetricEntry", foreign_keys="MetricEntry.submitted_by",
        backref="submitter", lazy=True
    )
    reviewed_entries = db.relationship(
        "MetricEntry", foreign_keys="MetricEntry.reviewed_by",
        backref="reviewer", lazy=True
    )
    audit_logs = db.relationship("AuditLog", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "school": self.school,
            "department": self.department,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ──────────────────────────────────────────────
# 2. Criterion (NAAC Criteria 1–7)
# ──────────────────────────────────────────────
class Criterion(db.Model):
    __tablename__ = "criteria"

    id = db.Column(db.Integer, primary_key=True)
    criterion_number = db.Column(db.String(10), unique=True, nullable=False)   # "C1"–"C7"
    title = db.Column(db.String(250), nullable=False)
    description = db.Column(db.Text, nullable=True)
    weightage = db.Column(db.Float, nullable=False, default=0.0)              # NAAC prescribed

    # Relationships
    key_indicators = db.relationship("KeyIndicator", backref="criterion",
                                     lazy=True, cascade="all, delete-orphan")
    scores = db.relationship("Score", backref="criterion", lazy=True,
                             cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "criterion_number": self.criterion_number,
            "title": self.title,
            "description": self.description,
            "weightage": self.weightage,
            "key_indicators_count": len(self.key_indicators),
        }


# ──────────────────────────────────────────────
# 3. Key Indicator (under a Criterion)
# ──────────────────────────────────────────────
class KeyIndicator(db.Model):
    __tablename__ = "key_indicators"

    id = db.Column(db.Integer, primary_key=True)
    criterion_id = db.Column(db.Integer, db.ForeignKey("criteria.id"), nullable=False)
    indicator_code = db.Column(db.String(20), nullable=False)   # e.g. "1.1", "2.3"
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, nullable=True)
    max_score = db.Column(db.Float, nullable=False, default=0.0)

    # Relationships
    metrics = db.relationship("Metric", backref="key_indicator",
                              lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "criterion_id": self.criterion_id,
            "indicator_code": self.indicator_code,
            "title": self.title,
            "description": self.description,
            "max_score": self.max_score,
            "metrics_count": len(self.metrics),
        }


# ──────────────────────────────────────────────
# 4. Metric (under a Key Indicator)
# ──────────────────────────────────────────────
class Metric(db.Model):
    __tablename__ = "metrics"

    id = db.Column(db.Integer, primary_key=True)
    key_indicator_id = db.Column(db.Integer, db.ForeignKey("key_indicators.id"), nullable=False)
    metric_code = db.Column(db.String(20), nullable=False)      # e.g. "1.1.1"
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, nullable=True)
    input_type = db.Column(
        db.Enum('quantitative', 'qualitative', name='input_type'),
        nullable=False, default='quantitative'
    )
    max_score = db.Column(db.Float, nullable=False, default=0.0)

    # Relationships
    entries = db.relationship("MetricEntry", backref="metric",
                              lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "key_indicator_id": self.key_indicator_id,
            "metric_code": self.metric_code,
            "title": self.title,
            "description": self.description,
            "input_type": self.input_type,
            "max_score": self.max_score,
            "entries_count": len(self.entries),
        }


# ──────────────────────────────────────────────
# 5. MetricEntry (data submitted per metric)
# ──────────────────────────────────────────────
class MetricEntry(db.Model):
    __tablename__ = "metric_entries"

    id = db.Column(db.Integer, primary_key=True)
    metric_id = db.Column(db.Integer, db.ForeignKey("metrics.id"), nullable=False)
    school = db.Column(db.String(150), nullable=True)
    department = db.Column(db.String(150), nullable=True)
    academic_year = db.Column(db.String(20), nullable=False)    # e.g. "2024-25"
    submitted_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    value_text = db.Column(db.Text, nullable=True)
    value_numeric = db.Column(db.Float, nullable=True)
    status = db.Column(
        db.Enum('draft', 'submitted', 'approved', 'rejected', name='entry_status'),
        nullable=False, default='draft'
    )
    reviewed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    review_comment = db.Column(db.Text, nullable=True)
    version = db.Column(db.Integer, nullable=False, default=1)
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "metric_id": self.metric_id,
            "school": self.school,
            "department": self.department,
            "academic_year": self.academic_year,
            "submitted_by": self.submitted_by,
            "value_text": self.value_text,
            "value_numeric": self.value_numeric,
            "status": self.status,
            "reviewed_by": self.reviewed_by,
            "review_comment": self.review_comment,
            "version": self.version,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ──────────────────────────────────────────────
# 6. AuditLog
# ──────────────────────────────────────────────
class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action = db.Column(db.String(50), nullable=False)           # create, update, delete, approve, reject
    table_name = db.Column(db.String(50), nullable=False)
    record_id = db.Column(db.Integer, nullable=False)
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "table_name": self.table_name,
            "record_id": self.record_id,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


# ──────────────────────────────────────────────
# 7. Score (computed / cached)
# ──────────────────────────────────────────────
class Score(db.Model):
    __tablename__ = "scores"

    id = db.Column(db.Integer, primary_key=True)
    school = db.Column(db.String(150), nullable=True)
    department = db.Column(db.String(150), nullable=True)
    academic_year = db.Column(db.String(20), nullable=False)
    criterion_id = db.Column(db.Integer, db.ForeignKey("criteria.id"), nullable=False)
    score = db.Column(db.Float, nullable=False, default=0.0)
    computed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "school": self.school,
            "department": self.department,
            "academic_year": self.academic_year,
            "criterion_id": self.criterion_id,
            "score": self.score,
            "computed_at": self.computed_at.isoformat() if self.computed_at else None,
        }


# ──────────────────────────────────────────────
# 8. TokenBlocklist (JWT revocation)
# ──────────────────────────────────────────────
class TokenBlocklist(db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)
    token_type = db.Column(db.String(10), nullable=False)  # access or refresh
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


# ──────────────────────────────────────────────
# Seed: 7 NAAC Criteria with real titles & weightages
# ──────────────────────────────────────────────
NAAC_CRITERIA_SEED = [
    {
        "criterion_number": "C1",
        "title": "Curricular Aspects",
        "description": "Curriculum design and development, academic flexibility, curriculum enrichment, and feedback system.",
        "weightage": 150,
    },
    {
        "criterion_number": "C2",
        "title": "Teaching-Learning and Evaluation",
        "description": "Student enrolment and profile, catering to student diversity, teaching-learning process, teacher profile and quality, evaluation process and reforms, student performance and learning outcomes.",
        "weightage": 200,
    },
    {
        "criterion_number": "C3",
        "title": "Research, Innovations and Extension",
        "description": "Resource mobilization for research, innovation ecosystem, research publications and awards, extension activities, and collaboration.",
        "weightage": 250,
    },
    {
        "criterion_number": "C4",
        "title": "Infrastructure and Learning Resources",
        "description": "Physical facilities, library as a learning resource, IT infrastructure, and maintenance of campus infrastructure.",
        "weightage": 100,
    },
    {
        "criterion_number": "C5",
        "title": "Student Support and Progression",
        "description": "Student support, student progression, student participation and activities, and alumni engagement.",
        "weightage": 100,
    },
    {
        "criterion_number": "C6",
        "title": "Governance, Leadership and Management",
        "description": "Institutional vision and leadership, strategy development and deployment, faculty empowerment strategies, financial management, and internal quality assurance system.",
        "weightage": 100,
    },
    {
        "criterion_number": "C7",
        "title": "Institutional Values and Best Practices",
        "description": "Institutional values and social responsibilities, best practices, and institutional distinctiveness.",
        "weightage": 100,
    },
]


def seed_criteria():
    """Seed the database with the 7 NAAC criteria if they don't already exist."""
    for data in NAAC_CRITERIA_SEED:
        existing = Criterion.query.filter_by(criterion_number=data["criterion_number"]).first()
        if not existing:
            criterion = Criterion(**data)
            db.session.add(criterion)
    db.session.commit()


def init_db(app):
    """Create all tables and seed initial data."""
    with app.app_context():
        db.create_all()
        seed_criteria()
