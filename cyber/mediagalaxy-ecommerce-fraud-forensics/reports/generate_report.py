import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)

def create_incident_report(output_pdf_path):
    os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#0f172a")
    accent_color = colors.HexColor("#dc2626")
    secondary_color = colors.HexColor("#2563eb")
    text_dark = colors.HexColor("#1e293b")
    bg_light = colors.HexColor("#f8fafc")
    border_color = colors.HexColor("#cbd5e1")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=accent_color,
        spaceAfter=12
    )
    
    heading2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=5
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_dark,
        spaceAfter=7
    )
    
    badge_style = ParagraphStyle(
        'DocBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=text_dark
    )
    
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    
    story = []
    
    # ---------------------------------------------------------
    # Header Banner
    # ---------------------------------------------------------
    header_data = [
        [
            Paragraph("<b>CYBERSECURITY INCIDENT RESPONSE FORENSICS REPORT</b>", ParagraphStyle('H1', parent=badge_style, fontSize=10, leading=12)),
            Paragraph("<b>TLP:CLEAR | PRIORITY 1</b>", ParagraphStyle('H2', parent=badge_style, alignment=2, fontSize=8.5, leading=11))
        ]
    ]
    header_table = Table(header_data, colWidths=[380, 150])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    
    # Document Title
    story.append(Paragraph("E-Commerce Brand Impersonation & Chinese SaaS Fraud Funnel", title_style))
    story.append(Paragraph("Case: <b>SEC-2026-ECOM-005</b> · Target: Media Galaxy (Altex România) · Live Sandbox Verified: 16 Sept 2026", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceAfter=8))
    
    # Metadata Summary Box
    meta_data = [
        [Paragraph("<b>Incident Type:</b> Social Media Phishing / Brand Impersonation", table_cell), Paragraph("<b>Financial Impact:</b> ~21 EUR (~105 RON)", table_cell)],
        [Paragraph("<b>Target Lure Platform:</b> TikTok Sponsored In-App Ads", table_cell), Paragraph("<b>Payment Rail:</b> BCR Debit Card (Direct)", table_cell)],
        [Paragraph("<b>Phishing Landing FQDN:</b> mediagalaxy.voetbalshop-nlco.com", table_cell), Paragraph("<b>Backend C2 SaaS:</b> yiyangsaas.com (Yunnan, CN)", table_cell)],
        [Paragraph("<b>Investigator:</b> @stefanutc1 (Senior Security Engineer)", table_cell), Paragraph("<b>Verification Mode:</b> Airtight Headless Chrome Sandbox", table_cell)],
    ]
    meta_table = Table(meta_data, colWidths=[265, 265])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))
    
    # Section 1: Executive Summary
    story.append(Paragraph("1. Executive Summary", heading2_style))
    summary_p1 = (
        "On 16 September 2026, an automated fraud campaign targeting Romanian citizens was detected and triaged. "
        "Threat actors weaponized high-volume sponsored advertisements within the <b>TikTok</b> mobile platform, "
        "cloning the brand, promotional visuals, and e-commerce identity of <b>Media Galaxy</b> (Altex România S.A.). "
        "Victims clicking the sponsored link were funneled via the mobile in-app browser to <code>mediagalaxy.voetbalshop-nlco.com</code>, "
        "a localized fraudulent checkout portal designed to steal payment card data and Personally Identifiable Information (PII)."
    )
    story.append(Paragraph(summary_p1, body_style))
    
    summary_p2 = (
        "A debit of approximately <b>21 EUR</b> was executed directly against the victim's BCR (Banca Comercială Română) debit card "
        "under the shell merchant descriptor <b>'morvethemi london'</b>. Immediately following payment authorization, the storefront switched to a deceptive "
        "maintenance screen (<code>'The website is under maintenance'</code>). Simultaneously, automated mail relays dispatched confirmation tokens "
        "(<code>[229942-177457]</code>) and password reset verification codes (<code>586571</code>) from spoofed domains (<code>email.worvixglobal.com</code>, "
        "<code>info.mailapp-fly.com</code>) to attempt secondary account takeover."
    )
    story.append(Paragraph(summary_p2, body_style))
    
    # Section 2: Live Technical Verification
    story.append(Paragraph("2. Live Web Verification & Infrastructure Forensics", heading2_style))
    tech_p1 = (
        "<b>A. Airtight Browser Probe & Shared Origin Proof:</b> Operating in an isolated headless Chrome sandbox, active network probes "
        "confirmed that <code>mediagalaxy.voetbalshop-nlco.com</code> and the central C2 domain <code>yiyangsaas.com</code> resolve to the "
        "<b>exact same IP (104.16.145.247)</b> on Cloudflare, definitively proving co-located infrastructure."
    )
    story.append(Paragraph(tech_p1, body_style))
    
    tech_p2 = (
        "<b>B. Targeted TikTok Ad Preloader & OEMCart Codebase:</b> Live DOM extraction revealed the explicit tag "
        "<code>&lt;meta name=\"tiktok-ads-preloading-nocache\" content=\"1\"&gt;</code>, proving purposeful weaponization of TikTok's in-app webview. "
        "Deobfuscating client scripts exposed the base64-decoded token <code>oemcart_</code> and asset path <code>/skins/default/guoqi.png</code> "
        "(<i>guoqi</i> = national flag in Chinese pinyin), confirming the application is built on China's OEMCart turnkey fraud suite."
    )
    story.append(Paragraph(tech_p2, body_style))
    
    tech_p3 = (
        "<b>C. Fresh Certificate Issuance & Burned Relays:</b> Live X.509 certificate extraction revealed that the SSL certificate for "
        "<code>mediagalaxy.voetbalshop-nlco.com</code> was issued on <b>September 15, 2026 at 00:43:20 GMT</b> (under 24h before the debit). "
        "Meanwhile, secondary email dispatch domains (<code>info.mailapp-fly.com</code>, <code>email.worvixglobal.com</code>) have already been burned to <code>NXDOMAIN</code>."
    )
    story.append(Paragraph(tech_p3, body_style))
    
    # Section 3: Evidence Matrix Table
    story.append(Paragraph("3. Evidence Matrix (Desktop Screenshots & Live Probes)", heading2_style))
    evidence_rows = [
        [Paragraph("<b>Evidence ID</b>", table_header), Paragraph("<b>Source / Artifact</b>", table_header), Paragraph("<b>Forensic Finding & Intelligence Value</b>", table_header)],
        [Paragraph("01-02_worvixglobal", table_cell), Paragraph("Desktop / WHOIS", table_cell), Paragraph("Shell trade facade registered at NameSilo (2025-02-08) to bypass NRD spam filters.", table_cell)],
        [Paragraph("03-06_email_lures", table_cell), Paragraph("Desktop / SMTP", table_cell), Paragraph("DKIM relay info.mailapp-fly.com, Reply-To MaryxBeckb96@gmail.com, fake token [229942-177457].", table_cell)],
        [Paragraph("07-10_dom_source", table_cell), Paragraph("Desktop / DevTools", table_cell), Paragraph("Subdomain mediagalaxy, <html lang='zh-CN'>, module_login_default, Cloudflare CDN.", table_cell)],
        [Paragraph("14_merchant_descriptor", table_cell), Paragraph("Desktop / Search", table_cell), Paragraph("'morvethemi london' has zero registered business records; offshore shell descriptor.", table_cell)],
        [Paragraph("19-22_c2_attribution", table_cell), Paragraph("Desktop / Certs", table_cell), Paragraph("Port 443 query revealed cn: yiyangsaas.com; eName Technology registrant in Yunnan, China.", table_cell)],
        [Paragraph("23-24_ato_lure", table_cell), Paragraph("Desktop / Mail", table_cell), Paragraph("Password reset code 586571 delivered to victim with spoofed MEDIACALAXY logo.", table_cell)],
        [Paragraph("LIVE_01_shared_ip", table_cell), Paragraph("Chrome Sandbox", table_cell), Paragraph("Shared IP 104.16.145.247 co-locating phishing frontend with yiyangsaas.com backend.", table_cell)],
        [Paragraph("LIVE_02_tiktok_tag", table_cell), Paragraph("Live DOM Extraction", table_cell), Paragraph("Meta tag tiktok-ads-preloading-nocache=1 and decoded oemcart_ Chinese engine scripts.", table_cell)],
        [Paragraph("LIVE_03_cert_dump", table_cell), Paragraph("Live OpenSSL Probe", table_cell), Paragraph("Fresh Google Trust cert issued Sep 15 2026; subdomains info.mailapp-fly.com burned.", table_cell)],
    ]
    evidence_table = Table(evidence_rows, colWidths=[110, 110, 310])
    evidence_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
    ]))
    story.append(evidence_table)
    story.append(Spacer(1, 8))
    
    story.append(PageBreak())
    
    # Section 4: Indicators of Compromise (IoCs)
    story.append(Paragraph("4. Indicators of Compromise (IoCs)", heading2_style))
    ioc_rows = [
        [Paragraph("<b>Indicator</b>", table_header), Paragraph("<b>Type</b>", table_header), Paragraph("<b>Threat Role</b>", table_header), Paragraph("<b>Enforcement Action</b>", table_header)],
        [Paragraph("mediagalaxy.voetbalshop-nlco.com", table_cell), Paragraph("FQDN", table_cell), Paragraph("Phishing Landing Subdomain", table_cell), Paragraph("DNS Sinkhole (0.0.0.0)", table_cell)],
        [Paragraph("voetbalshop-nlco.com", table_cell), Paragraph("Domain", table_cell), Paragraph("Base Infrastructure", table_cell), Paragraph("Gateway Unbound Block", table_cell)],
        [Paragraph("yiyangsaas.com", table_cell), Paragraph("Domain", table_cell), Paragraph("Backend C2 / Phishing SaaS", table_cell), Paragraph("Outbound Egress Drop", table_cell)],
        [Paragraph("worvixglobal.com", table_cell), Paragraph("Domain", table_cell), Paragraph("Attacker Shell & Mail Domain", table_cell), Paragraph("DNS Sinkhole & Mail Filter", table_cell)],
        [Paragraph("email.worvixglobal.com", table_cell), Paragraph("FQDN", table_cell), Paragraph("Order Fake Confirmation MTA", table_cell), Paragraph("Quarantine at Mail Gateway", table_cell)],
        [Paragraph("info.mailapp-fly.com", table_cell), Paragraph("FQDN", table_cell), Paragraph("ATO Verification Dispatcher", table_cell), Paragraph("Quarantine at Mail Gateway", table_cell)],
        [Paragraph("noreply@email.worvixglobal.com", table_cell), Paragraph("Email", table_cell), Paragraph("Phishing Sender", table_cell), Paragraph("SMTP Sender Blacklist", table_cell)],
        [Paragraph("noreply@info.mailapp-fly.com", table_cell), Paragraph("Email", table_cell), Paragraph("Phishing Sender", table_cell), Paragraph("SMTP Sender Blacklist", table_cell)],
        [Paragraph("MaryxBeckb96@gmail.com", table_cell), Paragraph("Email", table_cell), Paragraph("Attacker Drop Inbox", table_cell), Paragraph("Report to Google Trust & Safety", table_cell)],
        [Paragraph("brekerfurught@outlook.com", table_cell), Paragraph("Email", table_cell), Paragraph("Attacker Drop Inbox", table_cell), Paragraph("Report to Microsoft Abuse", table_cell)],
        [Paragraph("104.16.145.247 / 104.21.14.99", table_cell), Paragraph("IPv4", table_cell), Paragraph("Cloudflare Reverse Proxy IPs", table_cell), Paragraph("Firewall Floating Reject Rule", table_cell)],
        [Paragraph("morvethemi london", table_cell), Paragraph("Descriptor", table_cell), Paragraph("Fraudulent Bank Card Charge", table_cell), Paragraph("Dispute / Chargeback Filing", table_cell)],
    ]
    ioc_table = Table(ioc_rows, colWidths=[150, 45, 155, 180])
    ioc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 3),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
    ]))
    story.append(ioc_table)
    story.append(Spacer(1, 8))
    
    # Section 5: Incident Response & Chargeback Action Plan
    story.append(Paragraph("5. Incident Response & Chargeback Playbook", heading2_style))
    ir_p1 = (
        "<b>Phase 1: Card Lockdown & Session Invalidation:</b> The compromised debit card was immediately frozen and blocked through the "
        "George BCR banking application, followed by emergency cancellation and reissuance, preventing subsequent recurring billing attempts. "
        "All active Google/Gmail sessions for the victim were revoked, and FIDO2/Passkey authentication was enforced."
    )
    story.append(Paragraph(ir_p1, body_style))
    
    ir_p2 = (
        "<b>Phase 2: Bank Dispute Filing (Visa/Mastercard Chargeback):</b> A formal claim under <b>Visa Dispute Condition 13.1 / Mastercard Reason Code 4853 "
        "(Merchandise Not Received / Fraudulent Merchant)</b> was initiated through BCR customer support. Documentation including the deceptive order token "
        "<code>[229942-177457]</code>, offline maintenance status, and personal Gmail reply-to headers were attached to secure a full refund of the ~21 EUR transaction."
    )
    story.append(Paragraph(ir_p2, body_style))
    
    ir_p3 = (
        "<b>Phase 3: Perimeter Defense Integration on OPNsense Gateway (192.168.1.1):</b> "
        "<br/>• <b>Unbound DNS:</b> Deployed <code>domains.txt</code> to sinkhole queries to <code>0.0.0.0</code> across LAN/DMZ networks."
        "<br/>• <b>Suricata IDS/IPS:</b> Injected signatures <code>sid:1000951-1000956</code> to log and drop HTTP/TLS requests to fraudulent hosts."
        "<br/>• <b>Egress Filtering:</b> Applied floating firewall rules blocking TCP outbound traffic to Cloudflare proxy endpoints <code>104.16.145.247</code>."
    )
    story.append(Paragraph(ir_p3, body_style))
    
    ir_p4 = (
        "<b>Phase 4: Takedown & External Escalation:</b> Abuse notices were filed with Cloudflare Trust & Safety, NameSilo Abuse, eName Technology, "
        "and the Romanian National Cyber Security Directorate (<b>DNSC</b> - <code>alerts@dnsc.ro</code>)."
    )
    story.append(Paragraph(ir_p4, body_style))
    
    # Footer Signoff Box
    signoff_data = [
        [
            Paragraph("<b>Incident Status:</b> MITIGATED & SINKHOLED", table_cell),
            Paragraph("<b>Report Generated:</b> 16 September 2026", table_cell),
            Paragraph("<b>Approved By:</b> @stefanutc1 (Lead IR)", table_cell),
        ]
    ]
    signoff_table = Table(signoff_data, colWidths=[175, 175, 180])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(Spacer(1, 10))
    story.append(signoff_table)
    
    doc.build(story)
    print(f"Report generated successfully: {output_pdf_path}")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "reports/cybersecurity_report_final.pdf"
    create_incident_report(out_path)
