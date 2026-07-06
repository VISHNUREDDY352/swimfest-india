import sqlite3
db = sqlite3.connect('c:/Users/vishn/DEV/backend/swimfest.db')

# Show current data
row = db.execute("SELECT swimmer_id, full_name, parent_name, parent_relationship FROM swimmers WHERE swimmer_id='SWM-2026-FC14'").fetchone()
print(f"Current: Name={row[1]}, Parent={row[2]}, Relationship={row[3]}")

# The parent_name was incorrectly set to swimmer's name during old signup
# Since we don't know the actual parent name, set it to a placeholder
# The user can update via Edit Profile later
# For now just mark it clearly
db.execute("""UPDATE swimmers 
    SET parent_name = 'Parent of ' || full_name,
        parent_relationship = 'Father'
    WHERE swimmer_id='SWM-2026-FC14' AND parent_name = full_name""")
db.commit()

row2 = db.execute("SELECT parent_name, parent_relationship FROM swimmers WHERE swimmer_id='SWM-2026-FC14'").fetchone()
print(f"Updated: Parent={row2[0]}, Relationship={row2[1]}")
db.close()
