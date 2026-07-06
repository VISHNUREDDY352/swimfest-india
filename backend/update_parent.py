import sqlite3
db = sqlite3.connect('c:/Users/vishn/DEV/backend/swimfest.db')
db.execute("UPDATE swimmers SET parent_name='Yash', parent_relationship='Father' WHERE swimmer_id='SWM-2026-FC14'")
db.commit()
row = db.execute("SELECT parent_name, parent_relationship FROM swimmers WHERE swimmer_id='SWM-2026-FC14'").fetchone()
print(f"Updated: Parent Name = {row[0]}, Relationship = {row[1]}")
db.close()
