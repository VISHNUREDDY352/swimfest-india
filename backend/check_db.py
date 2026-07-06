import sqlite3

db = sqlite3.connect('c:/Users/vishn/DEV/backend/swimfest.db')
db.row_factory = sqlite3.Row

print('=== DATABASE STATUS ===')
tables = [r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
for t in tables:
    count = db.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0]
    print(f'  {t}: {count} rows')

print('\n=== ACADEMIES ===')
for r in db.execute('SELECT academy_id, name FROM academies').fetchall():
    print(f'  {r[0]} - {r[1]}')

print('\n=== TOURNAMENTS ===')
for r in db.execute('SELECT tournament_id, name, status FROM tournaments').fetchall():
    print(f'  {r[0]} - {r[1]} [{r[2]}]')

print('\n=== SWIMMERS ===')
for r in db.execute('SELECT swimmer_id, full_name, age_group FROM swimmers').fetchall():
    print(f'  {r[0]} - {r[1]} ({r[2]})')

print('\n=== BOOKINGS ===')
for r in db.execute('SELECT booking_id, swimmer_id, payment_status, total_paid FROM bookings').fetchall():
    print(f'  {r[0]} - Swimmer:{r[1]} Status:{r[2]} Paid:{r[3]}')

print('\nAll data is stored in: c:/Users/vishn/DEV/backend/swimfest.db')
db.close()
