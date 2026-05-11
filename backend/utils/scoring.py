"""Scoring utilities for NAAC accreditation grading."""

from models import db, Metric, MetricEntry, KeyIndicator, Criterion, Score


def compute_metric_score(metric_id, school, department, academic_year):
    """
    Fetch approved MetricEntry and compute its score.
    If quantitative: scored based on value_numeric.
    If qualitative: heuristic based on word count.
    When school/department is None, aggregate across ALL schools/departments.
    """
    metric = Metric.query.get(metric_id)
    if not metric:
        return 0.0

    query = MetricEntry.query.filter_by(
        metric_id=metric_id,
        status="approved"
    )
    if school:
        query = query.filter_by(school=school)
    if department:
        query = query.filter_by(department=department)
    if academic_year:
        query = query.filter_by(academic_year=academic_year)

    entries = query.all()
    if not entries:
        return 0.0

    # Take the best score across all matching entries
    best_score = 0.0
    for entry in entries:
        if metric.input_type == 'quantitative':
            val = entry.value_numeric or 0.0
            if metric.max_score > 0:
                score = (val / metric.max_score) * metric.max_score
                score = min(score, metric.max_score)
            else:
                score = val
        else:
            # Qualitative heuristic
            text = entry.value_text or ""
            word_count = len(text.split())
            score = (word_count / 100.0) * metric.max_score
            score = min(score, metric.max_score)

        if score > best_score:
            best_score = score

    return best_score


def compute_key_indicator_score(key_indicator_id, school, department, academic_year):
    """
    Sum metrics and normalize to key_indicator.max_score.
    """
    ki = KeyIndicator.query.get(key_indicator_id)
    if not ki:
        return 0.0

    total_metric_score = sum(
        compute_metric_score(m.id, school, department, academic_year)
        for m in ki.metrics
    )

    sum_metric_max = sum(m.max_score for m in ki.metrics)
    if sum_metric_max == 0:
        return 0.0

    normalized_score = (total_metric_score / sum_metric_max) * ki.max_score
    return round(normalized_score, 2)


def compute_criterion_score(criterion_id, school, department, academic_year):
    """
    Average key indicator percentages, multiply by criterion weightage.
    """
    criterion = Criterion.query.get(criterion_id)
    if not criterion:
        return 0.0

    sum_percentages = 0.0
    valid_kis = 0

    for ki in criterion.key_indicators:
        if ki.max_score > 0:
            ki_score = compute_key_indicator_score(ki.id, school, department, academic_year)
            sum_percentages += (ki_score / ki.max_score)
            valid_kis += 1

    if valid_kis == 0:
        return 0.0

    # Average the percentages weighted equally
    avg_percentage = sum_percentages / valid_kis
    criterion_score = round(avg_percentage * criterion.weightage, 2)

    # Cache result in Score model
    existing = Score.query.filter_by(
        criterion_id=criterion.id,
        school=school,
        department=department,
        academic_year=academic_year
    ).first()

    if existing:
        existing.score = criterion_score
    else:
        new_score = Score(
            criterion_id=criterion.id,
            school=school,
            department=department,
            academic_year=academic_year,
            score=criterion_score
        )
        db.session.add(new_score)
    
    db.session.commit()
    return criterion_score


def compute_overall_naac_score(school, department, academic_year):
    """
    Sum all criterion scores and compute CGPA out of 4.0.
    """
    criteria = Criterion.query.all()
    total_score = sum(
        compute_criterion_score(c.id, school, department, academic_year)
        for c in criteria
    )

    total_weightage = sum(c.weightage for c in criteria)
    if total_weightage == 0:
        return 0.0

    cgpa = (total_score / total_weightage) * 4.0
    return round(cgpa, 2)


def determine_grade(cgpa):
    """Map CGPA to NAAC grade."""
    if cgpa >= 3.51: return "A++"
    if cgpa >= 3.26: return "A+"
    if cgpa >= 3.01: return "A"
    if cgpa >= 2.76: return "B++"
    if cgpa >= 2.51: return "B+"
    if cgpa >= 2.01: return "B"
    if cgpa >= 1.51: return "C"
    if cgpa > 0: return "D"
    return "Not Graded"
