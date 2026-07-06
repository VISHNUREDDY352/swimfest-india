import sqlite3
db = sqlite3.connect('c:/Users/vishn/DEV/backend/swimfest.db')
db.execute("UPDATE swimmers SET academy_id='ACD-003' WHERE swimmer_id='SWM-2026-FC14'")
db.commit()
print("Updated to Madurai Marlins (ACD-003)")
db.close()
