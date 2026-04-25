from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Criterion, User, MetricEntry
from utils.scoring import compute_overall_naac_score, determine_grade, compute_criterion_score

scores_bp = Blueprint("scores", __name__)


@scores_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_scores_summary():
    """
    Get a summary of computed NAAC scores based on approved metrics.
    Role checks:
    - superadmin, iqac, vice_chancellor can query any school/dept.
    - dean is restricted to their own school.
    - hod, faculty are restricted to their own school and department.
    """
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    req_school = request.args.get("school")
    req_dept = request.args.get("department")
    academic_year = request.args.get("academic_year")

    if not academic_year:
        return jsonify({"error": "academic_year is required"}), 400

    # Role enforcement
    if user.role in ("faculty", "hod"):
        school = user.school
        department = user.department
    elif user.role == "dean":
        school = user.school
        department = req_dept  # Dean can query any department within their school
    else:
        # iqac, vice_chancellor, superadmin
        school = req_school
        department = req_dept

    criteria = Criterion.query.order_by(Criterion.criterion_number).all()
    criteria_results = []

    for c in criteria:
        # compute_criterion_score averages KI percentages and caches to Score DB
        score = compute_criterion_score(c.id, school, department, academic_year)

        # Calculate completion percentage for UI
        total_metrics = 0
        filled_metrics = 0
        for ki in c.key_indicators:
            for m in ki.metrics:
                total_metrics += 1
                
                # Check if there is an approved entry
                query = MetricEntry.query.filter_by(
                    metric_id=m.id,
                    academic_year=academic_year,
                    status="approved"
                )
                if school: query = query.filter_by(school=school)
                if department: query = query.filter_by(department=department)
                
                entry = query.first()
                if entry:
                    filled_metrics += 1

        completion = (filled_metrics / total_metrics * 100) if total_metrics > 0 else 0

        criteria_results.append({
            "criterion_number": c.criterion_number,
            "title": c.title,
            "weightage": c.weightage,
            "score": score,
            "completion_percentage": round(completion, 2)
        })

    # The compute_overall_naac_score will internally call compute_criterion_score again (cached)
    cgpa = compute_overall_naac_score(school, department, academic_year)
    grade = determine_grade(cgpa)

    return jsonify({
        "academic_year": academic_year,
        "school": school,
        "department": department,
        "criteria_scores": criteria_results,
        "overall_cgpa": cgpa,
        "grade": grade
    }), 200
