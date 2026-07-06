"""
SwimFest India — Email Service
Sends booking confirmations via Gmail SMTP
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ═══════════════════════════════════════════
# CONFIGURATION — Update these with your credentials
# ═══════════════════════════════════════════
SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'www.roy7547@gmail.com'
SENDER_PASSWORD = 'hjwybgtstmavbrew'
SENDER_NAME = 'SwimFest India'

# Email is now enabled
EMAIL_ENABLED = True


def send_booking_confirmation(to_email, swimmer_name, swimmer_id, booking_id, 
                               age_group, events, total_paid, tournament_name):
    """Send booking confirmation email after successful payment"""
    
    if not EMAIL_ENABLED or not SENDER_PASSWORD:
        print(f"[EMAIL] Skipped (not configured) — would send to {to_email}")
        return False

    # HTML Email Template
    events_html = ''
    for ev in events:
        events_html += f'<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f4f8">{ev["event_name"]}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f4f8">{ev.get("seed_time","NT")}</td></tr>'

    html_body = f"""
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0a1628 0%,#1d4ed8 100%);padding:24px;text-align:center;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;font-size:1.4rem;margin:0 0 4px">Booking Confirmed!</h1>
            <p style="color:rgba(255,255,255,.7);font-size:.85rem;margin:0">{tournament_name}</p>
        </div>
        
        <!-- Body -->
        <div style="padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            
            <p style="font-size:.9rem;color:#374151;margin-bottom:16px">
                Hi <strong>{swimmer_name}</strong>,<br/><br/>
                Your registration for <strong>{tournament_name}</strong> has been confirmed. 
                Payment received successfully.
            </p>
            
            <!-- Booking Details -->
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:16px">
                <table style="width:100%;font-size:.85rem;border-collapse:collapse">
                    <tr><td style="padding:6px 0;color:#64748b">Booking ID</td><td style="padding:6px 0;font-weight:700;text-align:right">{booking_id}</td></tr>
                    <tr><td style="padding:6px 0;color:#64748b">Swimmer ID</td><td style="padding:6px 0;font-weight:700;text-align:right;font-family:monospace">{swimmer_id}</td></tr>
                    <tr><td style="padding:6px 0;color:#64748b">Age Group</td><td style="padding:6px 0;font-weight:700;text-align:right">{age_group}</td></tr>
                    <tr><td style="padding:6px 0;color:#64748b">Amount Paid</td><td style="padding:6px 0;font-weight:700;text-align:right;color:#16a34a">Rs. {total_paid}</td></tr>
                </table>
            </div>
            
            <!-- Events -->
            <h3 style="font-size:.85rem;color:#0a1628;margin-bottom:8px">Registered Events</h3>
            <table style="width:100%;font-size:.82rem;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
                <thead>
                    <tr style="background:#0a1628;color:#fff">
                        <th style="padding:8px 12px;text-align:left">Event</th>
                        <th style="padding:8px 12px;text-align:left">Seed Time</th>
                    </tr>
                </thead>
                <tbody>
                    {events_html}
                </tbody>
            </table>
            
            <!-- Important Info -->
            <div style="background:#fffbeb;border:1px solid #fde047;border-radius:8px;padding:12px;margin-top:16px;font-size:.82rem;color:#92400e">
                <strong>Important — Day 1 Check-in:</strong><br/>
                Please arrive at <strong>SRM University, Kattankulathur</strong> by <strong>8:00 AM on June 20, 2026</strong>.<br/>
                Carry all original documents: Age proof, Non-medalist declaration, Academy authorization, Parent consent.
            </div>
            
            <!-- Footer -->
            <p style="font-size:.78rem;color:#94a3b8;margin-top:20px;text-align:center">
                SwimFest India | SRM University, Kattankulathur, TN 603203<br/>
                Phone: +91 44 2745 2270 | Email: swimming@srmist.edu.in
            </p>
        </div>
    </div>
    """

    # Build email
    msg = MIMEMultipart('alternative')
    msg['From'] = f'{SENDER_NAME} <{SENDER_EMAIL}>'
    msg['To'] = to_email
    msg['Subject'] = f'Booking Confirmed — {tournament_name} | {swimmer_id}'
    
    # Plain text fallback
    text_body = f"""
Booking Confirmed — {tournament_name}

Swimmer: {swimmer_name}
Swimmer ID: {swimmer_id}
Booking ID: {booking_id}
Age Group: {age_group}
Amount Paid: Rs. {total_paid}

Events: {', '.join(ev['event_name'] for ev in events)}

Check-in: June 20, 2026 at 8:00 AM
Venue: SRM University, Kattankulathur, TN 603203

Carry all original documents.

— SwimFest India
"""
    
    msg.attach(MIMEText(text_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        print(f"[EMAIL] Sent confirmation to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send to {to_email}: {e}")
        return False


# Test function
if __name__ == '__main__':
    print("Email Service Test")
    print(f"  Configured: {EMAIL_ENABLED}")
    print(f"  Sender: {SENDER_EMAIL}")
    print(f"  Password set: {'Yes' if SENDER_PASSWORD else 'No — set SENDER_PASSWORD in email_service.py'}")
    
    if EMAIL_ENABLED:
        success = send_booking_confirmation(
            to_email='vishnureddi04@gmail.com',
            swimmer_name='Test Swimmer',
            swimmer_id='SWM-2026-TEST',
            booking_id='BKG-TEST001',
            age_group='U-14 Boys',
            events=[{'event_name': '100m Freestyle', 'seed_time': '00:58.72'}],
            total_paid='1,062',
            tournament_name='Golden Non-Medalist Championship 2026'
        )
        print(f"  Result: {'Sent!' if success else 'Failed'}")
    else:
        print("  To enable: Set SENDER_PASSWORD and EMAIL_ENABLED=True")
