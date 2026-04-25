import io
import csv
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required
from models import db, MetricEntry, Metric, KeyIndicator, Criterion, User
from utils.scoring import compute_overall_naac_score, compute_criterion_score, determine_grade
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/naac-summary", methods=["GET"])
@jwt_required()
def get_naac_summary():
    """Structured JSON report representing the NAAC summary."""
    school = request.args.get("school")
    academic_year = request.args.get("academic_year")
    
    overall_cgpa = compute_overall_naac_score(school, None, academic_year)
    grade = determine_grade(overall_cgpa)
    
    # Build criteria scores list
    criteria_list = Criterion.query.order_by(Criterion.criterion_number).all()
    criteria_scores = []
    for c in criteria_list:
        score = compute_criterion_score(c.id, school, None, academic_year)
        criteria_scores.append({
            "criterion_number": c.criterion_number,
            "title": c.title,
            "weightage": c.weightage,
            "score": score
        })
    
    total_metrics = Metric.query.count()
    if school and academic_year:
        filled_metrics = db.session.query(MetricEntry.metric_id).filter_by(school=school, academic_year=academic_year).distinct().count()
    elif academic_year:
        filled_metrics = db.session.query(MetricEntry.metric_id).filter_by(academic_year=academic_year).distinct().count()
    else:
        filled_metrics = db.session.query(MetricEntry.metric_id).distinct().count()
        
    completion_percentage = (filled_metrics / total_metrics * 100) if total_metrics > 0 else 0

    return jsonify({
        "institution": "NAAC Automated University",
        "school": school or "All Schools",
        "academic_year": academic_year or "All Years",
        "overall_score": round(overall_cgpa, 2),
        "grade": grade,
        "completion_percentage": round(completion_percentage, 1),
        "criteria": criteria_scores
    }), 200

@reports_bp.route("/export/csv", methods=["GET"])
@jwt_required()
def export_csv():
    """Export all metric entries as CSV."""
    school = request.args.get("school")
    department = request.args.get("department")
    academic_year = request.args.get("academic_year")
    
    query = MetricEntry.query
    if school: query = query.filter_by(school=school)
    if department: query = query.filter_by(department=department)
    if academic_year: query = query.filter_by(academic_year=academic_year)
    
    entries = query.all()
    
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Metric Code', 'Title', 'School', 'Department', 'Year', 'Value Numeric', 'Status', 'Submitted By', 'Reviewed By', 'Review Comment'])
    
    for e in entries:
        m = Metric.query.get(e.metric_id)
        sub_user = User.query.get(e.submitted_by) if e.submitted_by else None
        rev_user = User.query.get(e.reviewed_by) if e.reviewed_by else None
        
        cw.writerow([
            m.metric_code if m else 'N/A',
            m.title if m else 'N/A',
            e.school,
            e.department,
            e.academic_year,
            e.value_numeric if e.value_numeric is not None else 'Text Entry',
            e.status,
            sub_user.name if sub_user else 'Unknown',
            rev_user.name if rev_user else '',
            e.review_comment or ''
        ])
        
    output = io.BytesIO()
    output.write(si.getvalue().encode('utf-8'))
    output.seek(0)
    
    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"naac_export_{academic_year or 'all'}.csv"
    )

@reports_bp.route("/export/pdf", methods=["GET"])
@jwt_required()
def export_pdf():
    """Export the structured NAAC summary as a PDF using reportlab."""
    school = request.args.get("school")
    academic_year = request.args.get("academic_year")
    
    overall_cgpa = compute_overall_naac_score(school, None, academic_year)
    grade = determine_grade(overall_cgpa)
    
    criteria_list = Criterion.query.order_by(Criterion.criterion_number).all()
    criteria_scores = []
    for c in criteria_list:
        score = compute_criterion_score(c.id, school, None, academic_year)
        criteria_scores.append({
            "criterion_number": c.criterion_number,
            "title": c.title,
            "weightage": c.weightage,
            "score": score
        })
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    elements.append(Paragraph("NAAC Accreditation Summary Report", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Metadata
    elements.append(Paragraph(f"<b>Institution:</b> NAAC Automated University", styles['Normal']))
    elements.append(Paragraph(f"<b>School:</b> {school or 'All Schools'}", styles['Normal']))
    elements.append(Paragraph(f"<b>Academic Year:</b> {academic_year or 'All Years'}", styles['Normal']))
    elements.append(Spacer(1, 24))
    
    # Overall Score
    elements.append(Paragraph(f"<b>Overall CGPA:</b> {round(overall_cgpa, 2)} / 4.00", styles['Heading2']))
    elements.append(Paragraph(f"<b>Predicted NAAC Grade:</b> {grade}", styles['Heading2']))
    elements.append(Spacer(1, 24))
    
    # Table data
    data = [['Criterion', 'Title', 'Weightage', 'Score / 4.00']]
    for c in criteria_scores:
        data.append([
            c['criterion_number'],
            Paragraph(c['title'], styles['Normal']),
            str(c['weightage']),
            str(round(c['score'], 2))
        ])
        
    t = Table(data, colWidths=[60, 250, 70, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    elements.append(t)
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"naac_report_{academic_year or 'all'}.pdf"
    )
