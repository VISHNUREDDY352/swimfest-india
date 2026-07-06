import sqlite3
db = sqlite3.connect('c:/Users/vishn/DEV/backend/swimfest.db')
db.execute("DELETE FROM event_entries WHERE swimmer_id='SWM-2026-162B'")
db.execute("DELETE FROM bookings WHERE swimmer_id='SWM-2026-162B'")
db.execute("DELETE FROM heat_sheets WHERE swimmer_id='SWM-2026-162B'")
db.execute("DELETE FROM swimmers WHERE swimmer_id='SWM-2026-162B'")
db.execute("DELETE FROM swimmers WHERE swimmer_id='SWM-2026-0847'")
db.commit()
rows = db.execute('SELECT swimmer_id, full_name FROM swimmers').fetchall()
print('Remaining swimmers:')
for r in rows:
    print(f'  {r[0]} | {r[1]}')
db.close()
print('Cleanup done!')
