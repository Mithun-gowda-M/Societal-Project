"""
Script to generate a confidential PDF document containing all 25 BloodConnect test credentials.
Uses reportlab.
"""

import sys
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_pdf():
    pdf_filename = "c:/Users/mithu/societal project/BloodConnect-Test-Credentials.pdf"
    
    # Use landscape A4 with compact margins
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=landscape(A4),
        rightMargin=28,
        leftMargin=28,
        topMargin=24,
        bottomMargin=24
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#990011') # Crimson
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#333333')
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=colors.HexColor('#111827'),
        spaceBefore=8,
        spaceAfter=4
    )

    notice_style = ParagraphStyle(
        'NoticeBox',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#1f2937')
    )

    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#111827')
    )

    cell_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#111827')
    )

    cell_pass_style = ParagraphStyle(
        'TableCellPass',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#990011')
    )

    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    elements = []

    # Document Header
    elements.append(Paragraph("🩸 BloodConnect — Confidential Test Credentials Dossier", title_style))
    elements.append(Spacer(1, 2))
    elements.append(Paragraph("Platform Security Credentials & 31 Verified Database Profiles (Authorized Clinical & Evaluation Use Only)", subtitle_style))
    elements.append(Spacer(1, 6))

    # Security Notice Callout Box
    notice_text = (
        "<b>IMPORTANT SECURITY NOTICE:</b><br/>"
        "• <b>Executive Admin Password:</b> <font color='#990011'><b>BMMCGS5353@m</b></font> (Required for System Administrator login at <code>admin@bloodconnect.local</code> or <code>/admin</code>)<br/>"
        "• <b>Clinical Staff PIN & Cooldown Override:</b> <font color='#990011'><b>2026</b></font> (Used for live blood bank stock adjustments (+/-) and Medical Officer 90-day cooldown overrides)<br/>"
        "• <b>Notice:</b> These credentials have been removed from the public website interface for security. Keep this PDF confidential."
    )
    
    notice_table = Table(
        [[Paragraph(notice_text, notice_style)]],
        colWidths=[785]
    )
    notice_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEE2E2')), # Soft red tint
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#DC2626')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(notice_table)
    elements.append(Spacer(1, 8))

    # Section 1: The 31 Test Accounts Table
    elements.append(Paragraph("📋 Complete 31 Registered Test Account Profiles (Admin, Hospitals, Blood Banks, Donors & Patients)", h2_style))

    # Table columns: #, Role, Name / Facility, Email / Username, Password, Blood Group, Location, Phone & WhatsApp, Clinical Purpose
    col_widths = [22, 70, 126, 134, 108, 48, 92, 88, 97]

    raw_data = [
        # Admin
        ("1", "SYS ADMIN", "Chief Medical Administrator", "admin@bloodconnect.local", "BMMCGS5353@m", "N/A", "Central Oversight", "+91 80 2670 9999", "Full Platform Governance & Audits"),
        # Hospitals
        ("2", "HOSPITAL", "Victoria Hospital Trauma ICU", "victoria.trauma@bmcri.edu.in", "Victoria2026@Trauma", "Trauma ICU", "KR Market, Bengaluru", "+91 80 2670 1150\nWA: +919845011150", "Emergency Requisitions & Triage"),
        ("3", "HOSPITAL", "NIMHANS Neuro-Trauma Centre", "emergency@nimhans.ac.in", "Nimhans2026@Neuro", "Neuro ICU", "Dairy Circle, Bengaluru", "+91 80 2699 5000\nWA: +919845035000", "Critical Neuro-Surgery Requests"),
        ("4", "HOSPITAL", "AIIMS New Delhi Apex Trauma", "apex.trauma@aiims.edu", "Aiims2026@Trauma", "Level 1 Trauma", "Ansari Nagar, New Delhi", "+91 11 2658 8500\nWA: +919811028500", "Apex National Trauma Coordination"),
        ("5", "HOSPITAL", "Lilavati Hospital & Research ICU", "emergency@lilavatihospital.com", "Lilavati2026@ICU", "Cardiac ICU", "Bandra West, Mumbai", "+91 22 2675 1000\nWA: +919820075100", "Western Metro Emergency Care"),
        ("6", "HOSPITAL", "Rajiv Gandhi Govt General (MMC)", "mmc.emergency@tn.gov.in", "Mmc2026@Emergency", "Level 1 Trauma", "Park Town, Chennai", "+91 44 2530 5000\nWA: +919840030500", "South India Apex Transfusion Desk"),
        # Blood Banks
        ("7", "BLOOD BANK", "Rotary Bangalore TTK Blood Centre", "rotary.ttk@bloodbank.org", "Rotary2026@Bank (PIN: 2026)", "All Units", "HAL 3rd Stage, Bengaluru", "+91 80 2528 7903\nWA: +919845057903", "Apheresis & Whole Blood (+/- Editor)"),
        ("8", "BLOOD BANK", "AIIMS New Delhi Central Blood Centre", "bloodbank@aiims.edu", "Aiims2026@Delhi (PIN: 2026)", "National Hub", "Ansari Nagar, New Delhi", "+91 11 2658 8500\nWA: +919811028500", "National Capital Inventory Sync"),
        ("9", "BLOOD BANK", "KEM Hospital Blood Bank Mumbai", "kem.blood@mcgm.gov.in", "Kem2026@Mumbai (PIN: 2026)", "Western Hub", "Parel, Mumbai", "+91 22 2410 7000\nWA: +919820010700", "Municipal Stock Management"),
        ("10", "BLOOD BANK", "Indian Red Cross Society HQ", "bloodbank@indianredcross.org", "Redcross2026@HQ (PIN: 2026)", "National Vol.", "Red Cross Rd, New Delhi", "+91 11 2371 1551\nWA: +919811071155", "Voluntary Blood Program Oversight"),
        # Donors
        ("11", "DONOR", "Dr. Arjun K. Rao", "arjun.rao@blr-med.org", "Arjun@2026Blood", "O+", "Indiranagar, Bengaluru", "+91 98451 12233", "Available (>90d), 14 donations"),
        ("12", "DONOR", "Priyanka Sharma", "priyanka.s@gmail.com", "Priya@2026Donate", "A+", "Koramangala, Bengaluru", "+91 98802 23344", "Available, 8 donations, 4.9★"),
        ("13", "DONOR", "Karthik Venkatesh", "karthik.v@techblr.io", "Karthik@UniversalO", "O- (Univ.)", "Jayanagar, Bengaluru", "+91 97413 34455", "Available, Universal Red Cell Lifesaver"),
        ("14", "DONOR", "Sneha Nandakumar", "sneha.n@outlook.com", "Sneha@BPositive", "B+", "Whitefield, Bengaluru", "+91 96324 45566", "In 90-Day Cooldown (PIN 2026 Override)"),
        ("15", "DONOR", "Rohan Deshmukh", "rohan.d@fintech.in", "Rohan@ABPlatelets", "AB+", "Malleshwaram, Bengaluru", "+91 95135 56677", "Available, 11 donations, Platelets"),
        ("16", "DONOR", "Ananya Hegde", "ananya.h@ecity.org", "Ananya@RareBlood", "A-", "Electronic City, BLR", "+91 94486 67788", "Available, Rare Rh- Negative Group"),
        ("17", "DONOR", "Vikramaditya Rathore", "vikram.rathore@delhi-adv.in", "Vikram@DelhiB", "B-", "Connaught Place, Delhi", "+91 98101 22334", "Available, Rare B- Negative"),
        ("18", "DONOR", "Meera Iyer", "meera.iyer@mumbai-art.org", "Meera@MumbaiO", "O+", "Bandra West, Mumbai", "+91 98200 44556", "Available, 7 donations, Mumbai Hub"),
        ("19", "DONOR", "Dr. Aravind Swamy", "aravind.swamy@chennai-med.edu", "Aravind@RareAB", "AB-", "T. Nagar, Chennai", "+91 98400 66778", "Available, Ultra Rare AB- Group"),
        ("20", "DONOR", "Rajeshwari Patel", "rajeshwari.p@ahmedabad-tech.in", "Rajeshwari@GujO", "O- (Univ.)", "SG Highway, Ahmedabad", "+91 98250 88990", "Available, Western India Universal O-"),
        ("21", "DONOR", "Faizan Ahmed", "faizan.a@hyd-eng.in", "Faizan@HydA", "A+", "Banjara Hills, Hyderabad", "+91 98490 11223", "Available, Deccan Tech Corridor"),
        ("22", "DONOR", "Debojyoti Mukherjee", "debojyoti.m@kol-legal.in", "Debo@KolB", "B+", "Salt Lake, Kolkata", "+91 98300 88991", "Available, Eastern Transfusion Desk"),
        ("23", "DONOR", "Tanvi Verma", "tanvi.verma@jaipur-des.in", "Tanvi@JprO", "O+", "C-Scheme, Jaipur", "+91 98290 33445", "Available, Rajasthan Network"),
        ("24", "DONOR", "Suresh Menon", "suresh.menon@kochi-shipping.in", "Suresh@KocB", "B-", "Marine Drive, Kochi", "+91 98470 88992", "Available, Coastal Kerala Network"),
        ("25", "DONOR", "Kavya Reddy", "kavya.reddy@hsr-tech.in", "Kavya@HsrAB", "AB+", "HSR Layout, Bengaluru", "+91 98860 11224", "Available, Universal Plasma Donor"),
        # Patients & Family Requesters
        ("26", "PATIENT", "Rajeshwari Sundaram", "rajeshwari.patient@karnataka-health.gov.in", "Rajeshwari2026@Patient", "O-", "Victoria Trauma ICU", "+91 98450 77112", "Father: Ramesh Sundaram (Transfused)"),
        ("27", "PATIENT", "Kavitha Gowda", "kavitha.gowda@blr-patient.org", "Kavitha2026@Patient", "B+", "Indira Gandhi Child Hosp", "+91 97412 88223", "Child: Master Chetan (Transfused)"),
        ("28", "PATIENT", "Farhan Qureshi", "farhan.qureshi@stjohns-patient.in", "Farhan2026@Patient", "Platelets", "St. John's Medical Coll.", "+91 98490 33441", "Self: Dengue SDP Apheresis Unit"),
        ("29", "PATIENT", "Sunita Shinde", "sunita.shinde@bowring-patient.org", "Sunita2026@Patient", "A+", "Bowring Trauma ICU", "+91 98801 55662", "Husband: Ashok Shinde (Transfused)"),
        ("30", "PATIENT", "Anand Murthy", "anand.murthy@heartcare-blr.org", "Anand2026@Patient", "O+", "Sri Jayadeva Cardiology", "+91 96321 66773", "Mother: Smt. Shakuntala (Bypass OT)"),
        ("31", "PATIENT", "Meenakshi Nair", "meenakshi.nair@kidwai-patient.org", "Meenakshi2026@Patient", "A-", "Kidwai Memorial Oncology", "+91 94481 99884", "Sister: Ananya Nair (Chemo Support)")
    ]

    table_data = [[
        Paragraph("<b>#</b>", header_cell_style),
        Paragraph("<b>Role</b>", header_cell_style),
        Paragraph("<b>Facility / Name</b>", header_cell_style),
        Paragraph("<b>Email / Username</b>", header_cell_style),
        Paragraph("<b>Password</b>", header_cell_style),
        Paragraph("<b>Blood Grp</b>", header_cell_style),
        Paragraph("<b>Location</b>", header_cell_style),
        Paragraph("<b>Contact</b>", header_cell_style),
        Paragraph("<b>Status / Purpose</b>", header_cell_style),
    ]]

    for row in raw_data:
        num, role, name, email, pwd, grp, loc, contact, purpose = row
        table_data.append([
            Paragraph(num, cell_bold_style),
            Paragraph(f"<b>{role}</b>", cell_style),
            Paragraph(name, cell_bold_style),
            Paragraph(f"<code>{email}</code>", cell_style),
            Paragraph(f"<b>{pwd}</b>", cell_pass_style),
            Paragraph(f"<b>{grp}</b>", cell_bold_style),
            Paragraph(loc, cell_style),
            Paragraph(contact.replace('\n', '<br/>'), cell_style),
            Paragraph(purpose, cell_style),
        ])

    cred_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#990011')), # Crimson Header
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]

    # Alternating row colors
    for r in range(1, len(table_data)):
        if r % 2 == 0:
            t_style.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F9FAFB')))
        else:
            t_style.append(('BACKGROUND', (0, r), (-1, r), colors.white))

    cred_table.setStyle(TableStyle(t_style))
    elements.append(cred_table)
    elements.append(Spacer(1, 8))

    # Section 2: Emergency Helplines Table
    elements.append(Paragraph("🚨 National Emergency Ambulance & Trauma Desk Helplines", h2_style))
    
    emg_data = [
        [
            Paragraph("<b>Emergency Service</b>", header_cell_style),
            Paragraph("<b>Dial Helpline</b>", header_cell_style),
            Paragraph("<b>Operational Availability</b>", header_cell_style),
            Paragraph("<b>Operational Scope & Deployment Notes</b>", header_cell_style)
        ],
        [
            Paragraph("<b>National Free Emergency Ambulance</b>", cell_bold_style),
            Paragraph("<b>108</b>", cell_pass_style),
            Paragraph("24 Hours / 365 Days", cell_style),
            Paragraph("Free government-backed emergency trauma, cardiac, and road accident ambulance dispatch.", cell_style)
        ],
        [
            Paragraph("<b>Maternal & Neonatal Ambulance (CATS)</b>", cell_bold_style),
            Paragraph("<b>102</b>", cell_pass_style),
            Paragraph("24 Hours / 365 Days", cell_style),
            Paragraph("Dedicated transportation for pregnant mothers, newborns, and pediatric emergencies.", cell_style)
        ],
        [
            Paragraph("<b>National Unified Emergency Services</b>", cell_bold_style),
            Paragraph("<b>112</b>", cell_pass_style),
            Paragraph("24 Hours / 365 Days", cell_style),
            Paragraph("Single pan-India unified dispatch coordinating Police, Fire, and Medical response.", cell_style)
        ],
        [
            Paragraph("<b>BMCRI Victoria Trauma ICU Helpline</b>", cell_bold_style),
            Paragraph("<b>+91 80 2670 1150</b>", cell_style),
            Paragraph("24 Hours Live Desk", cell_style),
            Paragraph("Central Bengaluru Trauma and Emergency Resuscitation Phlebotomy Unit.", cell_style)
        ],
        [
            Paragraph("<b>AIIMS Delhi Central Trauma Requisition</b>", cell_bold_style),
            Paragraph("<b>+91 11 2658 8500</b>", cell_style),
            Paragraph("24 Hours Live Desk", cell_style),
            Paragraph("Apex National Trauma Centre and critical mass-casualty blood requisition desk.", cell_style)
        ]
    ]

    emg_table = Table(emg_data, colWidths=[180, 100, 130, 375], repeatRows=1)
    emg_t_style = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')), # Dark slate
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]
    for r in range(1, len(emg_data)):
        if r % 2 == 0:
            emg_t_style.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F8FAFC')))
        else:
            emg_t_style.append(('BACKGROUND', (0, r), (-1, r), colors.white))

    emg_table.setStyle(TableStyle(emg_t_style))
    elements.append(emg_table)
    elements.append(Spacer(1, 6))

    # Footer notice
    footer_text = Paragraph(
        "<font size='7.5' color='#6B7280'>© 2026 BloodConnect — AI-Powered Blood Donation & Transfusion Platform • Confidential Access Dossier • For Evaluator & Administrator Eyes Only</font>",
        subtitle_style
    )
    elements.append(footer_text)

    doc.build(elements)
    print(f"SUCCESS: PDF generated cleanly at: {pdf_filename}")

if __name__ == '__main__':
    generate_pdf()
