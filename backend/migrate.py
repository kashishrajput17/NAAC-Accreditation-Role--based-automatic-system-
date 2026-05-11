import sqlite3
try:
    conn = sqlite3.connect('C:/Users/user/Desktop/NAAC/naac-system/backend/instance/naac.db')
    conn.execute('ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT 1')
    conn.commit()
    print("Migration successful: added is_active to users")
except Exception as e:
    print("Migration failed or already applied:", e)
finally:
    conn.close()
