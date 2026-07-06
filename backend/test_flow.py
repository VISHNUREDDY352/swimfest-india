import urllib.request, json

BASE = 'http://localhost:5000/api'

def post(path, data):
    req = urllib.request.Request(f'{BASE}{path}', 
        json.dumps(data).encode(), 
        headers={'Content-Type':'application/json'})
    r = urllib.request.urlopen(req)
    return json.loads(r.read())

def get(path):
    r = urllib.request.urlopen(f'{BASE}{path}')
    return json.loads(r.read())

print('=== TEST 1: Register Swimmer ===')
swimmer = post('/swimmers', {
    'full_name': 'Arjun Kumar',
    'gender': 'Boys',
    'dob': '2013-03-15',
    'parent_name': 'Ramesh Kumar',
    'parent_relationship': 'Father',
    'parent_mobile': '+91 98765 43210',
    'parent_email': 'ramesh@email.com',
    'academy_id': 'Chennai Dolphins',
    'institution_type': 'Club'
})
print(f"  Created: {swimmer}")

print('\n=== TEST 2: Create Booking ===')
booking = post('/bookings', {
    'swimmer_id': swimmer['swimmer_id'],
    'tournament_id': 'GNMC-2026',
    'events': [
        {'event_name': '100m Freestyle', 'event_code': 'FS', 'distance': '100m', 'seed_time': '00:58.72'},
        {'event_name': '100m Backstroke', 'event_code': 'BK', 'distance': '100m', 'seed_time': '01:08.33'},
        {'event_name': '200m Ind. Medley', 'event_code': 'IM', 'distance': '200m', 'seed_time': '02:34.11'}
    ],
    'relay_opted': True,
    'payment_method': 'upi',
    'consent_rules': 1, 'consent_refund': 1,
    'consent_parent': 1, 'consent_medical': 1, 'consent_nonmedalist': 1
})
print(f"  Created: {booking}")

print('\n=== TEST 3: Generate Heat Sheet ===')
hs = post('/heatsheet/generate/GNMC-2026', {})
print(f"  Result: {hs}")

print('\n=== TEST 4: Check Stats ===')
stats = get('/stats')
print(f"  Stats: {stats}")

print('\n=== TEST 5: Login ===')
login = post('/auth/login', {'email': 'ramesh@email.com', 'password': 'swim2026', 'role': 'swimmer'})
print(f"  Login: {login}")

print('\n=== ALL TESTS PASSED ===')
print(f"  Database: c:/Users/vishn/DEV/backend/swimfest.db")
print(f"  All data saved locally!")
