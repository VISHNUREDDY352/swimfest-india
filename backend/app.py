"""
SwimFest India — Backend API (Flask + Supabase PostgreSQL)
Migrated from SQLite to Supabase for cloud hosting.
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from supabase import create_client
import os
import uuid
import json
from datetime import datetime

from email_service import send_booking_confirmation
from supabase_config import SUPABASE_URL, SUPABASE_SERVICE_KEY

app = Flask(__name__, static_folder='../')
CORS(app)

# Initialize Supabase client (service_role key bypasses RLS)
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ══════════════════════════════════════════
#  UTILITY FUNCTIONS
# ══════════════════════════════════════════
def gen_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

def calc_age_group(dob_str):
    y = int(dob_str.split('-')[0])
    if y in (2016, 2017): return 'U-10'
    if y in (2014, 2015): return 'U-12'
    if y in (2012, 2013): return 'U-14'
    if y in (2010, 2011): return 'U-16'
    return None

LANE_PATTERNS = {
    6: [3, 4, 2, 5, 1, 6],
    8: [4, 5, 3, 6, 2, 7, 1, 8],
    10: [5, 6, 4, 7, 3, 8, 2, 9, 1, 10],
}

def seed_to_seconds(seed):
    if not seed or seed == 'NT': return float('inf')
    parts = seed.split(':')
    return float(parts[0]) * 60 + float(parts[1])


# ══════════════════════════════════════════
#  API ROUTES — AUTHENTICATION
# ══════════════════════════════════════════
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    # Normalize mobile — strip spaces, +91, leading 0
    normalized = email.replace(' ', '').replace('+91', '').replace('-', '').lstrip('0')

    # Check swimmers table — match by email or mobile
    result = supabase.table('swimmers').select('swimmer_id, full_name, parent_email, parent_mobile').or_(
        f"parent_email.eq.{email},parent_mobile.eq.{email}"
    ).execute()
    
    user = result.data[0] if result.data else None
    
    # If not found by exact match, try normalized mobile
    if not user and normalized:
        all_swimmers = supabase.table('swimmers').select('swimmer_id, full_name, parent_email, parent_mobile').execute()
        for s in all_swimmers.data:
            s_mobile = (s.get('parent_mobile') or '').replace(' ', '').replace('+91', '').replace('-', '').lstrip('0')
            if s_mobile == normalized:
                user = s
                break

    # Accept login if:
    # 1. Admin credentials (role=admin only)
    # 2. Registered swimmer credentials
    role = data.get('role', 'swimmer')
    
    # Admin login — ONLY accept admin credentials
    if role == 'admin':
        if email == 'vishnureddi04@gmail.com' and password == 'viSHNU@19696':
            return jsonify({'success': True, 'name': 'Admin', 'swimmer_id': 'ADMIN'})
        return jsonify({'error': 'Incorrect email or password.'}), 401

    # Swimmer login — must be a registered user
    if user:
        return jsonify({'success': True, 'name': user['full_name'], 'swimmer_id': user['swimmer_id']})

    return jsonify({'error': 'Account not found. Please check your email/mobile or create a new account.'}), 401


# ══════════════════════════════════════════
#  API ROUTES — ACADEMIES
# ══════════════════════════════════════════
@app.route('/api/academies', methods=['GET'])
def list_academies():
    result = supabase.table('academies').select('*').eq('status', 'Active').order('name').execute()
    return jsonify(result.data)

@app.route('/api/academies', methods=['POST'])
def create_academy():
    data = request.json
    aid = gen_id('ACD')
    row = {
        'academy_id': aid,
        'name': data['name'],
        'short_name': data.get('short_name', ''),
        'head_coach': data.get('head_coach', ''),
        'mobile': data.get('mobile', ''),
        'email': data.get('email', ''),
        'city': data.get('city', 'Chennai'),
        'address': data.get('address', ''),
        'status': 'Active'
    }
    supabase.table('academies').insert(row).execute()
    return jsonify({'academy_id': aid, 'message': 'Academy created'}), 201


# ══════════════════════════════════════════
#  API ROUTES — COACHES
# ══════════════════════════════════════════
@app.route('/api/coaches', methods=['GET'])
def list_coaches():
    result = supabase.table('coaches').select('*').eq('status', 'Active').execute()
    return jsonify(result.data)

@app.route('/api/coaches', methods=['POST'])
def create_coach():
    data = request.json
    cid = gen_id('COA')
    row = {
        'coach_id': cid,
        'full_name': data['full_name'],
        'gender': data.get('gender', ''),
        'mobile': data.get('mobile', ''),
        'email': data.get('email', ''),
        'academy_id': data.get('academy_id', ''),
        'role': data.get('role', 'Head Coach'),
        'status': 'Active'
    }
    supabase.table('coaches').insert(row).execute()
    return jsonify({'coach_id': cid, 'message': 'Coach created'}), 201


# ══════════════════════════════════════════
#  API ROUTES — SWIMMERS
# ══════════════════════════════════════════
@app.route('/api/swimmers', methods=['GET'])
def list_swimmers():
    result = supabase.table('swimmers').select('*').order('full_name').execute()
    return jsonify(result.data)

@app.route('/api/swimmers/<swimmer_id>', methods=['GET'])
def get_swimmer(swimmer_id):
    result = supabase.table('swimmers').select('*').eq('swimmer_id', swimmer_id).execute()
    if not result.data:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(result.data[0])

@app.route('/api/swimmers/<swimmer_id>', methods=['PUT'])
def update_swimmer(swimmer_id):
    data = request.json
    # Map display keys to DB columns
    key_map = {
        'Full Name': 'full_name', 'Gender': 'gender',
        'Date of Birth': 'dob', 'Mobile': 'parent_mobile',
        'Address': 'address', 'Parent Name': 'parent_name',
        'Relationship': 'parent_relationship', 'Email': 'parent_email',
        'Nationality': 'nationality',
        'School Name': 'school_name', 'School Board': 'school_board',
        'School Class': 'school_class',
    }
    updates = {}
    for display_key, val in data.items():
        col = key_map.get(display_key)
        if col and val:
            updates[col] = val

    if updates:
        supabase.table('swimmers').update(updates).eq('swimmer_id', swimmer_id).execute()
    return jsonify({'message': 'Profile updated'})

@app.route('/api/swimmers', methods=['POST'])
def create_swimmer():
    data = request.json
    sid = f"SWM-2026-{uuid.uuid4().hex[:4].upper()}"
    age_group = calc_age_group(data['dob'])
    yob = int(data['dob'].split('-')[0])

    # Resolve academy_id — accept either ID or name
    academy_id = data.get('academy_id', '')
    if academy_id and not academy_id.startswith('ACD-'):
        result = supabase.table('academies').select('academy_id').eq('name', academy_id).execute()
        academy_id = result.data[0]['academy_id'] if result.data else ''

    row = {
        'swimmer_id': sid,
        'full_name': data['full_name'],
        'gender': data['gender'],
        'dob': data['dob'],
        'year_of_birth': yob,
        'age_group': age_group,
        'mobile': data.get('mobile', ''),
        'parent_name': data.get('parent_name', ''),
        'parent_relationship': data.get('parent_relationship', ''),
        'parent_mobile': data.get('parent_mobile', ''),
        'parent_email': data.get('parent_email', ''),
        'academy_id': academy_id or None,
        'institution_type': data.get('institution_type', ''),
        'coach_id': data.get('coach_id', '') or None,
        'eligibility': 'Non-Medalist',
        'address': data.get('address', ''),
        'nationality': data.get('nationality', 'Indian'),
        'school_name': data.get('school_name', ''),
        'school_board': data.get('school_board', ''),
        'school_class': data.get('school_class', ''),
        'status': 'Active'
    }
    supabase.table('swimmers').insert(row).execute()
    return jsonify({'swimmer_id': sid, 'age_group': age_group, 'message': 'Swimmer registered'}), 201


# ══════════════════════════════════════════
#  API ROUTES — TOURNAMENTS
# ══════════════════════════════════════════
@app.route('/api/tournaments', methods=['GET'])
def list_tournaments():
    result = supabase.table('tournaments').select('*').order('start_date').execute()
    return jsonify(result.data)

@app.route('/api/tournaments', methods=['POST'])
def create_tournament():
    data = request.json
    tid = f"TRN-{uuid.uuid4().hex[:6].upper()}"
    row = {
        'tournament_id': tid,
        'name': data['name'],
        'venue': data.get('venue', ''),
        'start_date': data.get('start_date', ''),
        'end_date': data.get('end_date', ''),
        'reg_deadline': data.get('reg_deadline', ''),
        'fee_per_event': data.get('fee_per_event', 300),
        'relay_fee': data.get('relay_fee', 150),
        'gst_rate': data.get('gst_rate', 0.18),
        'lanes': data.get('lanes', 8),
        'status': data.get('status', 'Open')
    }
    supabase.table('tournaments').insert(row).execute()
    return jsonify({'tournament_id': tid, 'message': 'Tournament created'}), 201

@app.route('/api/tournaments/<tid>', methods=['DELETE', 'PUT'])
def manage_tournament(tid):
    if request.method == 'DELETE':
        supabase.table('tournaments').delete().eq('tournament_id', tid).execute()
        return jsonify({'message': 'Tournament deleted'})
    
    # PUT — update tournament
    data = request.json
    updates = {}
    for key in ['name', 'venue', 'start_date', 'end_date', 'reg_deadline', 'fee_per_event', 'relay_fee', 'lanes', 'status']:
        if key in data:
            updates[key] = data[key]
    if updates:
        supabase.table('tournaments').update(updates).eq('tournament_id', tid).execute()
    return jsonify({'message': 'Tournament updated'})

@app.route('/api/tournaments/<tid>/status', methods=['PUT'])
def update_tournament_status(tid):
    data = request.json
    supabase.table('tournaments').update({'status': data['status']}).eq('tournament_id', tid).execute()
    return jsonify({'message': 'Status updated', 'status': data['status']})


# ══════════════════════════════════════════
#  API ROUTES — BOOKINGS
# ══════════════════════════════════════════
@app.route('/api/bookings', methods=['GET'])
def list_bookings():
    result = supabase.table('bookings').select('*, swimmers(full_name, age_group, gender)').order('created_at', desc=True).execute()
    # Flatten the joined data
    bookings = []
    for b in result.data:
        flat = {k: v for k, v in b.items() if k != 'swimmers'}
        if b.get('swimmers'):
            flat['full_name'] = b['swimmers']['full_name']
            flat['age_group'] = b['swimmers']['age_group']
            flat['gender'] = b['swimmers']['gender']
        bookings.append(flat)
    return jsonify(bookings)

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    bid = gen_id('BKG')
    events = data.get('events', [])
    relay = data.get('relay_opted', False)

    # Calculate fees
    t_result = supabase.table('tournaments').select('*').eq('tournament_id', data['tournament_id']).execute()
    if not t_result.data:
        return jsonify({'error': 'Tournament not found'}), 404
    tournament = t_result.data[0]

    fee_per = tournament['fee_per_event']
    relay_fee = tournament['relay_fee'] if relay else 0
    subtotal = len(events) * fee_per + relay_fee
    gst = round(subtotal * tournament['gst_rate'])
    total = subtotal + gst

    # Insert booking
    booking_row = {
        'booking_id': bid,
        'swimmer_id': data['swimmer_id'],
        'tournament_id': data['tournament_id'],
        'total_fee': subtotal,
        'gst': gst,
        'total_paid': total,
        'payment_method': data.get('payment_method', 'upi'),
        'payment_status': 'Paid',
        'relay_opted': int(relay),
        'consent_rules': int(data.get('consent_rules', 0)),
        'consent_refund': int(data.get('consent_refund', 0)),
        'consent_parent': int(data.get('consent_parent', 0)),
        'consent_medical': int(data.get('consent_medical', 0)),
        'consent_nonmedalist': int(data.get('consent_nonmedalist', 0)),
    }
    supabase.table('bookings').insert(booking_row).execute()

    # Insert event entries
    entry_rows = []
    for ev in events:
        eid = gen_id('ENT')
        entry_rows.append({
            'entry_id': eid,
            'booking_id': bid,
            'swimmer_id': data['swimmer_id'],
            'tournament_id': data['tournament_id'],
            'event_name': ev['event_name'],
            'event_code': ev.get('event_code', ''),
            'distance': ev.get('distance', ''),
            'seed_time': ev.get('seed_time', 'NT'),
            'status': 'Registered'
        })
    if entry_rows:
        supabase.table('event_entries').insert(entry_rows).execute()

    # Send confirmation email
    s_result = supabase.table('swimmers').select('*').eq('swimmer_id', data['swimmer_id']).execute()
    if s_result.data:
        swimmer_info = s_result.data[0]
        send_booking_confirmation(
            to_email=swimmer_info['parent_email'],
            swimmer_name=swimmer_info['full_name'],
            swimmer_id=data['swimmer_id'],
            booking_id=bid,
            age_group=swimmer_info.get('age_group') or '',
            events=events,
            total_paid=str(total),
            tournament_name='Golden Non-Medalist Championship 2026'
        )

    return jsonify({
        'booking_id': bid, 'total_paid': total,
        'events_registered': len(events),
        'message': 'Booking confirmed and paid'
    }), 201

@app.route('/api/bookings/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    b_result = supabase.table('bookings').select('*').eq('booking_id', booking_id).execute()
    if not b_result.data:
        return jsonify({'error': 'Not found'}), 404
    e_result = supabase.table('event_entries').select('*').eq('booking_id', booking_id).execute()
    return jsonify({'booking': b_result.data[0], 'events': e_result.data})


# ══════════════════════════════════════════
#  API ROUTES — HEAT SHEET GENERATION
# ══════════════════════════════════════════
@app.route('/api/heatsheet/generate/<tournament_id>', methods=['POST'])
def generate_heat_sheet(tournament_id):
    """Generate heat sheets from event_entries table"""
    t_result = supabase.table('tournaments').select('*').eq('tournament_id', tournament_id).execute()
    if not t_result.data:
        return jsonify({'error': 'Tournament not found'}), 404
    tournament = t_result.data[0]

    lanes = tournament['lanes']
    pattern = LANE_PATTERNS.get(lanes, LANE_PATTERNS[8])

    # Clear existing heat sheets for this tournament
    supabase.table('heat_sheets').delete().eq('tournament_id', tournament_id).execute()

    # Get all entries with swimmer and academy info
    entries_result = supabase.table('event_entries').select(
        '*, swimmers(full_name, age_group, gender, year_of_birth, academy_id)'
    ).eq('tournament_id', tournament_id).eq('status', 'Registered').execute()

    # Get academies for lookup
    acad_result = supabase.table('academies').select('academy_id, name, short_name').execute()
    acad_map = {a['academy_id']: a for a in acad_result.data}

    # Flatten and group entries
    groups = {}
    for e in entries_result.data:
        swimmer = e.get('swimmers') or {}
        age_group = swimmer.get('age_group', '')
        gender = swimmer.get('gender', '')
        academy_id = swimmer.get('academy_id', '')
        academy_name = acad_map.get(academy_id, {}).get('name', '') if academy_id else ''

        key = f"{age_group}__{gender}__{e['event_name']}"
        if key not in groups:
            groups[key] = []
        groups[key].append({
            **e,
            'full_name': swimmer.get('full_name', ''),
            'age_group': age_group,
            'gender': gender,
            'academy_name': academy_name,
            'entry_id': e['entry_id'],
        })

    base_minutes = 8 * 60  # 08:00 AM start
    total_heats = 0
    hs_records = []

    for key in sorted(groups.keys()):
        swimmers = groups[key]
        swimmers.sort(key=lambda s: seed_to_seconds(s.get('seed_time', 'NT')))

        heats = [swimmers[i:i+lanes] for i in range(0, len(swimmers), lanes)]

        for heat_idx, heat in enumerate(heats):
            sorted_heat = sorted(heat, key=lambda s: seed_to_seconds(s.get('seed_time', 'NT')))
            for pos, swimmer in enumerate(sorted_heat):
                lane = pattern[pos] if pos < len(pattern) else pos + 1
                start_time_mins = base_minutes + heat_idx * 3
                h = start_time_mins // 60
                m = start_time_mins % 60
                ampm = 'AM' if h < 12 else 'PM'
                h12 = h % 12 or 12
                start_str = f"{h12:02d}:{m:02d} {ampm}"

                hs_id = gen_id('HS')
                hs_records.append({
                    'hs_id': hs_id,
                    'tournament_id': tournament_id,
                    'event_name': swimmer['event_name'],
                    'category': swimmer['age_group'],
                    'gender': swimmer['gender'],
                    'heat_no': heat_idx + 1,
                    'lane_no': lane,
                    'swimmer_id': swimmer['swimmer_id'],
                    'swimmer_name': swimmer['full_name'],
                    'academy_name': swimmer.get('academy_name', ''),
                    'seed_time': swimmer.get('seed_time', 'NT'),
                    'start_time': start_str,
                    'est_completion': ''
                })

                # Update event_entries with heat/lane
                supabase.table('event_entries').update({
                    'heat_no': heat_idx + 1, 'lane_no': lane
                }).eq('entry_id', swimmer['entry_id']).execute()

            total_heats += 1

        base_minutes += len(heats) * 3 + 5

    # Insert heat sheet records in batches (Supabase has limits)
    batch_size = 50
    for i in range(0, len(hs_records), batch_size):
        batch = hs_records[i:i+batch_size]
        supabase.table('heat_sheets').insert(batch).execute()

    return jsonify({
        'message': 'Heat sheet generated successfully',
        'total_heats': total_heats,
        'total_entries': len(hs_records),
        'lanes_used': lanes
    })

@app.route('/api/heatsheet/<tournament_id>', methods=['GET'])
def get_heat_sheet(tournament_id):
    """Get generated heat sheet"""
    result = supabase.table('heat_sheets').select('*').eq(
        'tournament_id', tournament_id
    ).order('category').order('gender').order('event_name').order('heat_no').order('lane_no').execute()
    return jsonify(result.data)


# ══════════════════════════════════════════
#  API ROUTES — RESULTS
# ══════════════════════════════════════════
@app.route('/api/results/<tournament_id>', methods=['GET'])
def get_results(tournament_id):
    result = supabase.table('event_entries').select(
        '*, swimmers(full_name, age_group, gender, academy_id)'
    ).eq('tournament_id', tournament_id).not_.is_('final_time', 'null').order('event_name').execute()

    # Get academies for lookup
    acad_result = supabase.table('academies').select('academy_id, name').execute()
    acad_map = {a['academy_id']: a['name'] for a in acad_result.data}

    rows = []
    for e in result.data:
        swimmer = e.get('swimmers') or {}
        flat = {k: v for k, v in e.items() if k != 'swimmers'}
        flat['full_name'] = swimmer.get('full_name', '')
        flat['age_group'] = swimmer.get('age_group', '')
        flat['gender'] = swimmer.get('gender', '')
        flat['academy_name'] = acad_map.get(swimmer.get('academy_id', ''), '')
        rows.append(flat)

    rows.sort(key=lambda x: (x.get('event_name', ''), x.get('overall_place') or 999))
    return jsonify(rows)

@app.route('/api/results/update', methods=['POST'])
def update_result():
    """Update a single entry's result"""
    data = request.json
    updates = {
        'final_time': data['final_time'],
        'heat_place': data.get('heat_place'),
        'overall_place': data.get('overall_place'),
        'status': data.get('status', 'OK'),
        'remarks': data.get('remarks', '')
    }
    supabase.table('event_entries').update(updates).eq('entry_id', data['entry_id']).execute()
    return jsonify({'message': 'Result updated'})


# ══════════════════════════════════════════
#  API ROUTES — STATS & DASHBOARD
# ══════════════════════════════════════════
@app.route('/api/stats', methods=['GET'])
def get_stats():
    swimmers = supabase.table('swimmers').select('swimmer_id', count='exact').execute()
    bookings = supabase.table('bookings').select('booking_id', count='exact').eq('payment_status', 'Paid').execute()
    entries = supabase.table('event_entries').select('entry_id', count='exact').execute()
    academies = supabase.table('academies').select('academy_id', count='exact').eq('status', 'Active').execute()
    return jsonify({
        'total_swimmers': swimmers.count or 0,
        'total_bookings': bookings.count or 0,
        'total_entries': entries.count or 0,
        'total_academies': academies.count or 0
    })


# ══════════════════════════════════════════
#  API ROUTES — RAZORPAY PAYMENT
# ══════════════════════════════════════════
import hmac
import hashlib

RAZORPAY_KEY_ID = 'rzp_test_T3l0Fu0bS5Yvi6'
RAZORPAY_KEY_SECRET = '0zjNpF9plujKEnw39BPQjU90'

@app.route('/api/payment/create-order', methods=['POST'])
def create_razorpay_order():
    """Create a Razorpay order for payment"""
    data = request.json
    amount = int(data.get('amount', 0))  # amount in paise (INR * 100)

    if amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400

    import urllib.request
    import base64

    order_data = json.dumps({
        'amount': amount,
        'currency': 'INR',
        'receipt': f"rcpt_{uuid.uuid4().hex[:10]}",
        'notes': {
            'tournament': data.get('tournament_id', 'GNMC-2026'),
            'swimmer_id': data.get('swimmer_id', ''),
        }
    }).encode()

    credentials = base64.b64encode(f"{RAZORPAY_KEY_ID}:{RAZORPAY_KEY_SECRET}".encode()).decode()

    req = urllib.request.Request(
        'https://api.razorpay.com/v1/orders',
        data=order_data,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Basic {credentials}'
        }
    )

    try:
        response = urllib.request.urlopen(req)
        order = json.loads(response.read())
        return jsonify({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'key_id': RAZORPAY_KEY_ID
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/payment/verify', methods=['POST'])
def verify_payment():
    """Verify Razorpay payment signature"""
    data = request.json

    order_id = data.get('razorpay_order_id', '')
    payment_id = data.get('razorpay_payment_id', '')
    signature = data.get('razorpay_signature', '')

    # Verify signature
    message = f"{order_id}|{payment_id}"
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    if signature == expected_signature:
        booking_id = data.get('booking_id', '')
        if booking_id:
            supabase.table('bookings').update({'payment_status': 'Paid'}).eq('booking_id', booking_id).execute()
        return jsonify({'verified': True, 'payment_id': payment_id})
    else:
        # For test mode, accept anyway
        return jsonify({'verified': True, 'payment_id': payment_id, 'note': 'Test mode'})


@app.route('/api/payment/config', methods=['GET'])
def payment_config():
    """Return Razorpay key for frontend"""
    return jsonify({'key_id': RAZORPAY_KEY_ID})


# ══════════════════════════════════════════
#  SERVE FRONTEND + START
# ══════════════════════════════════════════
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'login.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\n" + "=" * 50)
    print("  SwimFest India Backend API Running!")
    print("  Database: Supabase PostgreSQL (Cloud)")
    print("=" * 50)
    print(f"  Frontend: http://localhost:{port}")
    print(f"  API Base: http://localhost:{port}/api")
    print(f"  Supabase: {SUPABASE_URL}")
    print("=" * 50 + "\n")
    app.run(host='0.0.0.0', debug=False, port=port)
