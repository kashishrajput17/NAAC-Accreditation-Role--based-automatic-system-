import os
from app import create_app
from models import db, User, Criterion, KeyIndicator, Metric, MetricEntry, AuditLog

app = create_app()


# ── Comprehensive Key Indicators & Metrics for all 7 NAAC Criteria ──

SEED_INDICATORS = {
    "C1": [
        {
            "code": "1.1", "title": "Curriculum Design and Development", "max_score": 50,
            "metrics": [
                {"code": "1.1.1", "title": "Curricula developed and implemented have relevance to local, national, regional and global developmental needs", "type": "qualitative", "max": 20},
                {"code": "1.1.2", "title": "Number of programmes where syllabus revision was carried out during the year", "type": "quantitative", "max": 30},
            ]
        },
        {
            "code": "1.2", "title": "Academic Flexibility", "max_score": 50,
            "metrics": [
                {"code": "1.2.1", "title": "Number of new courses introduced across all programmes during the year", "type": "quantitative", "max": 25},
                {"code": "1.2.2", "title": "Number of programmes with CBCS / Elective course system implemented", "type": "quantitative", "max": 25},
            ]
        },
        {
            "code": "1.3", "title": "Curriculum Enrichment", "max_score": 50,
            "metrics": [
                {"code": "1.3.1", "title": "Institution integrates cross-cutting issues into curriculum", "type": "qualitative", "max": 25},
                {"code": "1.3.2", "title": "Number of value-added courses for imparting transferable and life skills offered during the year", "type": "quantitative", "max": 25},
            ]
        },
    ],
    "C2": [
        {
            "code": "2.1", "title": "Student Enrolment and Profile", "max_score": 30,
            "metrics": [
                {"code": "2.1.1", "title": "Enrolment percentage", "type": "quantitative", "max": 15},
                {"code": "2.1.2", "title": "Percentage of seats filled against reserved categories as per applicable reservation policy", "type": "quantitative", "max": 15},
            ]
        },
        {
            "code": "2.2", "title": "Catering to Student Diversity", "max_score": 30,
            "metrics": [
                {"code": "2.2.1", "title": "Student-Full time teacher ratio for the year", "type": "quantitative", "max": 15},
                {"code": "2.2.2", "title": "Percentage of students from other States and Countries", "type": "quantitative", "max": 15},
            ]
        },
        {
            "code": "2.3", "title": "Teaching-Learning Process", "max_score": 40,
            "metrics": [
                {"code": "2.3.1", "title": "Student centric methods used for enhancing learning experiences", "type": "qualitative", "max": 20},
                {"code": "2.3.2", "title": "Number of teachers using ICT for effective teaching with LMS, e-books and e-resources", "type": "quantitative", "max": 20},
            ]
        },
    ],
    "C3": [
        {
            "code": "3.1", "title": "Resource Mobilization for Research", "max_score": 50,
            "metrics": [
                {"code": "3.1.1", "title": "Grants received from Government and non-government agencies for research projects (INR in Lakhs)", "type": "quantitative", "max": 25},
                {"code": "3.1.2", "title": "Number of departments with recognized research guides/supervisors", "type": "quantitative", "max": 25},
            ]
        },
        {
            "code": "3.2", "title": "Innovation Ecosystem", "max_score": 50,
            "metrics": [
                {"code": "3.2.1", "title": "Institution has created an ecosystem for innovations and a dedicated centre for research", "type": "qualitative", "max": 25},
                {"code": "3.2.2", "title": "Number of workshops/seminars conducted on innovation, IPR and entrepreneurship", "type": "quantitative", "max": 25},
            ]
        },
        {
            "code": "3.3", "title": "Research Publications and Awards", "max_score": 50,
            "metrics": [
                {"code": "3.3.1", "title": "Number of research papers published per teacher in Scopus/Web of Science/UGC indexed journals", "type": "quantitative", "max": 25},
                {"code": "3.3.2", "title": "Number of books and chapters published per teacher during the year", "type": "quantitative", "max": 25},
            ]
        },
        {
            "code": "3.4", "title": "Extension Activities", "max_score": 50,
            "metrics": [
                {"code": "3.4.1", "title": "Extension activities carried out in the neighbourhood community", "type": "qualitative", "max": 25},
                {"code": "3.4.2", "title": "Number of awards and recognitions received for extension activities", "type": "quantitative", "max": 25},
            ]
        },
    ],
    "C4": [
        {
            "code": "4.1", "title": "Physical Facilities", "max_score": 30,
            "metrics": [
                {"code": "4.1.1", "title": "The institution has adequate infrastructure and physical facilities for teaching-learning", "type": "qualitative", "max": 15},
                {"code": "4.1.2", "title": "Expenditure on infrastructure augmentation (INR in Lakhs)", "type": "quantitative", "max": 15},
            ]
        },
        {
            "code": "4.2", "title": "Library as a Learning Resource", "max_score": 30,
            "metrics": [
                {"code": "4.2.1", "title": "Library is automated using ILMS (Integrated Library Management System)", "type": "qualitative", "max": 15},
                {"code": "4.2.2", "title": "Total number of e-resources and e-journals available", "type": "quantitative", "max": 15},
            ]
        },
        {
            "code": "4.3", "title": "IT Infrastructure", "max_score": 40,
            "metrics": [
                {"code": "4.3.1", "title": "Number of classrooms and seminar halls with ICT-enabled facilities", "type": "quantitative", "max": 20},
                {"code": "4.3.2", "title": "Student-computer ratio", "type": "quantitative", "max": 20},
            ]
        },
    ],
    "C5": [
        {
            "code": "5.1", "title": "Student Support", "max_score": 30,
            "metrics": [
                {"code": "5.1.1", "title": "Percentage of students benefited by scholarships and freeships provided by the Government", "type": "quantitative", "max": 15},
                {"code": "5.1.2", "title": "Capacity development and skills enhancement activities organized", "type": "qualitative", "max": 15},
            ]
        },
        {
            "code": "5.2", "title": "Student Progression", "max_score": 30,
            "metrics": [
                {"code": "5.2.1", "title": "Percentage of placement of outgoing students during the year", "type": "quantitative", "max": 15},
                {"code": "5.2.2", "title": "Percentage of students qualifying in state/national/international level examinations", "type": "quantitative", "max": 15},
            ]
        },
        {
            "code": "5.3", "title": "Student Participation and Activities", "max_score": 40,
            "metrics": [
                {"code": "5.3.1", "title": "Number of awards/medals won in sports/cultural activities at national/international level", "type": "quantitative", "max": 20},
                {"code": "5.3.2", "title": "Presence of Student Council and its activities for institutional development and student welfare", "type": "qualitative", "max": 20},
            ]
        },
    ],
    "C6": [
        {
            "code": "6.1", "title": "Institutional Vision and Leadership", "max_score": 30,
            "metrics": [
                {"code": "6.1.1", "title": "The governance of the institution is reflective and participative", "type": "qualitative", "max": 15},
                {"code": "6.1.2", "title": "The effective leadership is visible in institutional practices", "type": "qualitative", "max": 15},
            ]
        },
        {
            "code": "6.2", "title": "Strategy Development and Deployment", "max_score": 30,
            "metrics": [
                {"code": "6.2.1", "title": "The institutional strategic plan is effectively deployed", "type": "qualitative", "max": 15},
                {"code": "6.2.2", "title": "The functioning of the institutional bodies is effective and efficient", "type": "qualitative", "max": 15},
            ]
        },
        {
            "code": "6.3", "title": "Faculty Empowerment Strategies", "max_score": 40,
            "metrics": [
                {"code": "6.3.1", "title": "Percentage of teachers provided with financial support for conferences and workshops", "type": "quantitative", "max": 20},
                {"code": "6.3.2", "title": "Number of professional development programs organized by the institution for teaching staff", "type": "quantitative", "max": 20},
            ]
        },
    ],
    "C7": [
        {
            "code": "7.1", "title": "Institutional Values and Social Responsibilities", "max_score": 40,
            "metrics": [
                {"code": "7.1.1", "title": "Number of gender equity initiatives by the institution during the year", "type": "quantitative", "max": 15},
                {"code": "7.1.2", "title": "The institution has facilities for alternate sources of energy and energy conservation measures", "type": "qualitative", "max": 10},
                {"code": "7.1.3", "title": "Describe the waste management and water harvesting systems adopted", "type": "qualitative", "max": 15},
            ]
        },
        {
            "code": "7.2", "title": "Best Practices", "max_score": 30,
            "metrics": [
                {"code": "7.2.1", "title": "Describe two best practices successfully implemented by the institution", "type": "qualitative", "max": 30},
            ]
        },
        {
            "code": "7.3", "title": "Institutional Distinctiveness", "max_score": 30,
            "metrics": [
                {"code": "7.3.1", "title": "Portray the performance of the institution in one area distinctive to its priority and thrust", "type": "qualitative", "max": 30},
            ]
        },
    ],
}


# ── Metric Entry Data (simulated approved entries) ──

ENTRY_DATA = {
    # Quantitative entries: (value_numeric, status)
    "1.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 28.0, "status": "approved"},
        {"school": "Engineering", "dept": "Electrical Engineering", "val": 22.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 18.0, "status": "submitted"},
        {"school": "Business", "dept": "Management", "val": 15.0, "status": "approved"},
    ],
    "1.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 24.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 12.0, "status": "approved"},
    ],
    "1.2.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 20.0, "status": "approved"},
        {"school": "Business", "dept": "Management", "val": 18.0, "status": "submitted"},
    ],
    "1.3.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 22.0, "status": "approved"},
    ],
    "2.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 14.5, "status": "approved"},
        {"school": "Engineering", "dept": "Electrical Engineering", "val": 12.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 10.0, "status": "submitted"},
        {"school": "Business", "dept": "Management", "val": 13.0, "status": "approved"},
    ],
    "2.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 13.0, "status": "approved"},
        {"school": "Engineering", "dept": "Electrical Engineering", "val": 11.0, "status": "approved"},
    ],
    "2.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 13.5, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 10.0, "status": "approved"},
    ],
    "2.2.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 12.0, "status": "approved"},
    ],
    "2.3.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 18.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 14.0, "status": "approved"},
    ],
    "3.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 23.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 20.0, "status": "approved"},
    ],
    "3.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 22.0, "status": "approved"},
    ],
    "3.2.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 20.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 16.0, "status": "submitted"},
    ],
    "3.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 24.0, "status": "approved"},
        {"school": "Engineering", "dept": "Electrical Engineering", "val": 18.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 22.0, "status": "approved"},
    ],
    "3.3.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 20.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 15.0, "status": "submitted"},
    ],
    "3.4.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 19.0, "status": "approved"},
    ],
    "4.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 14.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 11.0, "status": "approved"},
    ],
    "4.2.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 13.5, "status": "approved"},
    ],
    "4.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 18.0, "status": "approved"},
        {"school": "Engineering", "dept": "Electrical Engineering", "val": 14.0, "status": "submitted"},
    ],
    "4.3.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 17.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 12.0, "status": "approved"},
    ],
    "5.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 13.0, "status": "approved"},
        {"school": "Business", "dept": "Management", "val": 12.0, "status": "approved"},
    ],
    "5.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 14.0, "status": "approved"},
        {"school": "Engineering", "dept": "Electrical Engineering", "val": 11.0, "status": "approved"},
        {"school": "Business", "dept": "Management", "val": 10.0, "status": "submitted"},
    ],
    "5.2.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 13.0, "status": "approved"},
    ],
    "5.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 16.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 12.0, "status": "approved"},
    ],
    "6.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 18.0, "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "val": 14.0, "status": "approved"},
    ],
    "6.3.2": [
        {"school": "Engineering", "dept": "Computer Science", "val": 17.0, "status": "approved"},
    ],
    "7.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "val": 13.0, "status": "approved"},
        {"school": "Business", "dept": "Management", "val": 11.0, "status": "approved"},
    ],
}

# Qualitative entries: (value_text, status)
QUALITATIVE_ENTRIES = {
    "1.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "The curriculum has been developed in alignment with National Education Policy 2020, incorporating industry-relevant modules on AI, Machine Learning, Cloud Computing, and Cybersecurity. Regular consultations with industry partners like TCS, Infosys, and Wipro ensure that course outcomes meet national and global workforce demands. The programme includes mandatory internships and capstone projects addressing real-world problems. Curriculum review committees meet bi-annually to assess relevance and make recommendations.", "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "text": "Physics curriculum integrates computational physics, quantum information science, and renewable energy technology modules. Interdisciplinary courses with Chemistry and Mathematics departments foster holistic understanding. Regular curriculum reviews ensure alignment with UGC guidelines and emerging research frontiers.", "status": "approved"},
    ],
    "1.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Cross-cutting issues including gender equality, environmental sustainability, human rights, and professional ethics are embedded across 85% of courses. Dedicated modules on Green Computing, Sustainable Software Engineering, and Ethics in AI are part of the core curriculum. The department has organized 12 workshops on sustainability and 8 seminars on ethical computing in the current academic year.", "status": "approved"},
    ],
    "2.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "The institution employs experiential learning through project-based assessments, flipped classrooms, and peer-teaching models. Lab sessions are designed as problem-solving workshops rather than rote exercises. Faculty use case-study methodology in 70% of advanced courses. A mentorship program pairs senior students with freshers for academic guidance. Online learning platforms supplement classroom instruction with self-paced modules.", "status": "approved"},
        {"school": "Sciences", "dept": "Physics", "text": "Participative and interactive learning through laboratory-heavy curriculum, research colloquia, and journal club presentations. Students present research papers weekly and engage in computational simulations for advanced topics.", "status": "submitted"},
    ],
    "3.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "The department hosts a Centre for Innovation and Entrepreneurship that has incubated 15 student startups in the last three years. A dedicated research lab with GPU clusters supports AI/ML research. The Innovation Hub conducts monthly hackathons, maintains partnerships with 8 industry labs, and has filed 6 patents. Annual research symposiums attract papers from 20+ institutions nationally.", "status": "approved"},
    ],
    "3.4.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Active community engagement through digital literacy programmes in 12 neighbouring villages, free coding bootcamps for underprivileged youth, and technology solutions for local municipality. NSS unit conducted 40+ outreach events including health camps, environmental awareness drives, and skill development workshops. Swachh Bharat and Digital India initiatives actively supported.", "status": "approved"},
    ],
    "4.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "The institution maintains state-of-the-art infrastructure including 8 computing labs with 600+ workstations, 3 research labs with high-performance computing facilities, a digital library with 24/7 access, smart classrooms with interactive displays in all lecture halls, dedicated project rooms, and a well-equipped auditorium with 500-seat capacity. All buildings are Wi-Fi enabled with 1 Gbps connectivity.", "status": "approved"},
    ],
    "4.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Library is fully automated using Koha ILMS with RFID-based book tracking, self-checkout kiosks, and an integrated digital repository. Online access to 15,000+ e-journals through DELNET, IEEE Xplore, Springer, and ACM Digital Library subscriptions. Remote access facility available for all registered students and faculty.", "status": "approved"},
    ],
    "5.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Comprehensive skill enhancement programme including soft skills workshops, industry certification courses (AWS, Azure, Google Cloud), competitive exam coaching, aptitude training, mock interviews with HR professionals, and personality development sessions. 450+ students participated in capacity building activities during the year.", "status": "approved"},
    ],
    "5.3.2": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Active Student Council with elected representatives from each year and department. The council organizes technical festivals, cultural events, sports meets, and social responsibility initiatives. Student representation on key institutional committees including academic planning, anti-ragging, and grievance redressal. Annual budget of INR 15 Lakhs allocated for student activities.", "status": "approved"},
    ],
    "6.1.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Participative governance through Board of Studies, Academic Council, and departmental committees with representation from students, alumni, and industry partners. Strategic decisions involve stakeholder consultation. Monthly faculty meetings, quarterly HOD reviews, and annual planning retreats ensure inclusive participation. A transparent feedback mechanism allows all stakeholders to contribute to institutional improvement.", "status": "approved"},
    ],
    "6.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Leadership excellence demonstrated through decentralised decision-making, empowerment of department heads, and clear delegation of authority. The institution follows a transparent promotion policy, performance-based incentive system, and regular leadership development programmes. Faculty are encouraged to lead research groups, organize conferences, and mentor students for entrepreneurship.", "status": "approved"},
    ],
    "6.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Strategic plan deployed through yearly action plans with measurable KPIs. Progress reviewed quarterly by the Internal Quality Assurance Cell. Key initiatives include digital transformation of administrative processes, research output enhancement programme, industry collaboration expansion, and infrastructure modernization. 85% of annual targets achieved in the reporting year.", "status": "approved"},
    ],
    "6.2.2": [
        {"school": "Engineering", "dept": "Computer Science", "text": "All statutory bodies including Governing Council, Academic Council, Board of Studies, Finance Committee, and IQAC function effectively with regular meetings and documented minutes. Action-taken reports are prepared for each meeting. Compliance with UGC, AICTE, and university regulations is maintained through dedicated compliance officer.", "status": "approved"},
    ],
    "7.1.2": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Solar panels installed covering 5000 sq ft generating 150 kW of electricity. LED lighting across 100% of campus buildings. Rainwater harvesting system with 50,000-litre capacity. Energy audit conducted annually with progressive reduction targets. Green building certification for newest academic block.", "status": "approved"},
    ],
    "7.1.3": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Comprehensive waste management with source segregation, organic waste composting plant processing 200 kg/day, e-waste collection and certified recycling partnership, and zero single-use plastic policy. Rainwater harvesting with 8 collection points and stormwater management system. Treated wastewater recycled for gardening covering 3 acres of campus greenery.", "status": "approved"},
    ],
    "7.2.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "Best Practice 1 - Industry-Integrated Learning: Every student completes a minimum 6-month industry internship with structured mentorship from both academic and industry supervisors. This has resulted in a 92% placement rate and 15% of students receiving pre-placement offers. Best Practice 2 - Research-Driven Teaching: Faculty integrate their active research into classroom teaching through live project demonstrations, research paper discussions, and student involvement in ongoing funded projects. This has led to 40+ student co-authored publications in indexed journals.", "status": "approved"},
    ],
    "7.3.1": [
        {"school": "Engineering", "dept": "Computer Science", "text": "The institution is distinctively positioned as a hub for AI and Data Science education in the region, being the first to offer specialized B.Tech and M.Tech programmes in AI. The dedicated Centre of Excellence for Artificial Intelligence, funded with INR 2 Crore from government grants, has produced 25 research papers in top-tier venues, developed 3 patent-pending technologies for agricultural monitoring, and trained 500+ professionals through executive education programmes. Industry collaborations with Microsoft, Google, and NVIDIA provide students with cutting-edge computing resources.", "status": "approved"},
    ],
}


def seed_db():
    with app.app_context():
        print("=" * 60)
        print("NAAC Comprehensive Data Seeding")
        print("=" * 60)

        # ── 1. Seed Users ──
        users_to_add = [
            {"email": "admin@naac.edu", "name": "Super Admin", "role": "superadmin", "school": None, "department": None},
            {"email": "vc@naac.edu", "name": "Dr. Rajesh Sharma", "role": "vice_chancellor", "school": None, "department": None},
            {"email": "iqac@naac.edu", "name": "Dr. Priya Mehta", "role": "iqac", "school": None, "department": None},
            {"email": "dean_eng@naac.edu", "name": "Dr. Anil Kumar", "role": "dean", "school": "Engineering", "department": None},
            {"email": "hod_cs@naac.edu", "name": "Dr. Sunita Rao", "role": "hod", "school": "Engineering", "department": "Computer Science"},
            {"email": "fac_cs@naac.edu", "name": "Prof. Vikram Singh", "role": "faculty", "school": "Engineering", "department": "Computer Science"},
            {"email": "fac_cs2@naac.edu", "name": "Prof. Neha Gupta", "role": "faculty", "school": "Engineering", "department": "Computer Science"},
            {"email": "hod_ee@naac.edu", "name": "Dr. Ramesh Joshi", "role": "hod", "school": "Engineering", "department": "Electrical Engineering"},
            {"email": "fac_ee@naac.edu", "name": "Prof. Amit Patel", "role": "faculty", "school": "Engineering", "department": "Electrical Engineering"},
            {"email": "dean_sci@naac.edu", "name": "Dr. Kavita Nair", "role": "dean", "school": "Sciences", "department": None},
            {"email": "hod_phy@naac.edu", "name": "Dr. Suresh Menon", "role": "hod", "school": "Sciences", "department": "Physics"},
            {"email": "fac_phy@naac.edu", "name": "Prof. Deepa Iyer", "role": "faculty", "school": "Sciences", "department": "Physics"},
            {"email": "dean_bus@naac.edu", "name": "Dr. Manish Agarwal", "role": "dean", "school": "Business", "department": None},
            {"email": "hod_mgt@naac.edu", "name": "Dr. Pooja Verma", "role": "hod", "school": "Business", "department": "Management"},
            {"email": "fac_mgt@naac.edu", "name": "Prof. Ravi Tiwari", "role": "faculty", "school": "Business", "department": "Management"},
        ]

        print("\n[1/4] Seeding Users...")
        for ud in users_to_add:
            if not User.query.filter_by(email=ud['email']).first():
                u = User(name=ud['name'], email=ud['email'], role=ud['role'],
                         school=ud['school'], department=ud['department'], is_active=True)
                u.set_password("Admin@123")
                db.session.add(u)
                print(f"  + {ud['email']} ({ud['role']})")
        db.session.commit()

        # ── 2. Seed Key Indicators and Metrics ──
        print("\n[2/4] Seeding Key Indicators & Metrics...")
        for crit_num, indicators in SEED_INDICATORS.items():
            criterion = Criterion.query.filter_by(criterion_number=crit_num).first()
            if not criterion:
                print(f"  ! Criterion {crit_num} not found, skipping")
                continue

            for ki_data in indicators:
                existing_ki = KeyIndicator.query.filter_by(indicator_code=ki_data['code']).first()
                if existing_ki:
                    ki = existing_ki
                else:
                    ki = KeyIndicator(
                        criterion_id=criterion.id,
                        indicator_code=ki_data['code'],
                        title=ki_data['title'],
                        max_score=ki_data['max_score']
                    )
                    db.session.add(ki)
                    db.session.flush()
                    print(f"  + KI {ki_data['code']}: {ki_data['title'][:50]}...")

                for m_data in ki_data['metrics']:
                    existing_m = Metric.query.filter_by(metric_code=m_data['code']).first()
                    if not existing_m:
                        m = Metric(
                            key_indicator_id=ki.id,
                            metric_code=m_data['code'],
                            title=m_data['title'],
                            input_type=m_data['type'],
                            max_score=m_data['max']
                        )
                        db.session.add(m)
                        print(f"    + Metric {m_data['code']}: {m_data['title'][:40]}...")

        db.session.commit()

        # ── 3. Seed Metric Entries ──
        print("\n[3/4] Seeding Metric Entries...")
        faculty_map = {
            ("Engineering", "Computer Science"): "fac_cs@naac.edu",
            ("Engineering", "Electrical Engineering"): "fac_ee@naac.edu",
            ("Sciences", "Physics"): "fac_phy@naac.edu",
            ("Business", "Management"): "fac_mgt@naac.edu",
        }

        reviewer_map = {
            "Engineering": "dean_eng@naac.edu",
            "Sciences": "dean_sci@naac.edu",
            "Business": "dean_bus@naac.edu",
        }

        entry_count = 0

        # Quantitative entries
        for metric_code, entries in ENTRY_DATA.items():
            metric = Metric.query.filter_by(metric_code=metric_code).first()
            if not metric:
                continue
            for e in entries:
                existing = MetricEntry.query.filter_by(
                    metric_id=metric.id, school=e['school'],
                    department=e['dept'], academic_year='2024-25'
                ).first()
                if existing:
                    continue
                fac_email = faculty_map.get((e['school'], e['dept']))
                fac = User.query.filter_by(email=fac_email).first() if fac_email else None
                rev_email = reviewer_map.get(e['school'])
                rev = User.query.filter_by(email=rev_email).first() if rev_email else None

                entry = MetricEntry(
                    metric_id=metric.id, school=e['school'], department=e['dept'],
                    academic_year='2024-25',
                    submitted_by=fac.id if fac else 1,
                    value_numeric=e['val'], status=e['status'], version=1,
                    reviewed_by=rev.id if rev and e['status'] == 'approved' else None
                )
                db.session.add(entry)
                entry_count += 1

        # Qualitative entries
        for metric_code, entries in QUALITATIVE_ENTRIES.items():
            metric = Metric.query.filter_by(metric_code=metric_code).first()
            if not metric:
                continue
            for e in entries:
                existing = MetricEntry.query.filter_by(
                    metric_id=metric.id, school=e['school'],
                    department=e['dept'], academic_year='2024-25'
                ).first()
                if existing:
                    continue
                fac_email = faculty_map.get((e['school'], e['dept']))
                fac = User.query.filter_by(email=fac_email).first() if fac_email else None
                rev_email = reviewer_map.get(e['school'])
                rev = User.query.filter_by(email=rev_email).first() if rev_email else None

                entry = MetricEntry(
                    metric_id=metric.id, school=e['school'], department=e['dept'],
                    academic_year='2024-25',
                    submitted_by=fac.id if fac else 1,
                    value_text=e['text'], status=e['status'], version=1,
                    reviewed_by=rev.id if rev and e['status'] == 'approved' else None
                )
                db.session.add(entry)
                entry_count += 1

        db.session.commit()
        print(f"  + {entry_count} metric entries created")

        # ── 4. Seed Audit Logs ──
        print("\n[4/4] Seeding Audit Log entries...")
        admin = User.query.filter_by(email="admin@naac.edu").first()
        if admin and AuditLog.query.count() == 0:
            logs = [
                AuditLog(user_id=admin.id, action="create", table_name="users", record_id=1, new_value="Created Super Admin account"),
                AuditLog(user_id=admin.id, action="create", table_name="criteria", record_id=1, new_value="Seeded 7 NAAC Criteria"),
            ]
            fac_cs = User.query.filter_by(email="fac_cs@naac.edu").first()
            if fac_cs:
                logs.append(AuditLog(user_id=fac_cs.id, action="create", table_name="metric_entries", record_id=1, new_value="Submitted C1 metric 1.1.1 data"))
                logs.append(AuditLog(user_id=fac_cs.id, action="submit", table_name="metric_entries", record_id=1, old_value="draft", new_value="submitted"))
            dean = User.query.filter_by(email="dean_eng@naac.edu").first()
            if dean:
                logs.append(AuditLog(user_id=dean.id, action="review", table_name="metric_entries", record_id=1, old_value="submitted", new_value="approved"))
            db.session.add_all(logs)
            db.session.commit()
            print(f"  + {len(logs)} audit log entries created")

        # Summary
        print("\n" + "=" * 60)
        print("Seed Summary:")
        print(f"  Users: {User.query.count()}")
        print(f"  Criteria: {Criterion.query.count()}")
        print(f"  Key Indicators: {KeyIndicator.query.count()}")
        print(f"  Metrics: {Metric.query.count()}")
        print(f"  Metric Entries: {MetricEntry.query.count()}")
        print(f"  Audit Logs: {AuditLog.query.count()}")
        print("=" * 60)
        print("ALL passwords: Admin@123")
        print("=" * 60)


if __name__ == "__main__":
    seed_db()
