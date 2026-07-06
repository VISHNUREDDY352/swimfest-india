"""
Setup Supabase Tables for SwimFest India
Run this ONCE to create all required tables in Supabase.
"""

from supabase import create_client
from supabase_config import SUPABASE_URL, SUPABASE_SERVICE_KEY
import uuid
from datetime import datetime

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# SQL to create all tables — run via Supabase SQL Editor or REST
# We'll use the REST API to create tables via raw SQL

CREATE_TABLES_SQL = """
-- Drop existing tables (in dependency order) if starting fresh
DROP TABLE IF EXISTS heat_sheets CASCADE;
DROP TABLE IF EXISTS event_entries CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS swimmers CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS academies CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;

-- Academies table
CREATE TABLE academies (
    academy_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    head_coach TEXT,
    mobile TEXT,
    email TEXT,
    city TEXT DEFAULT 'Chennai',
    address TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coaches table
CREATE TABLE coaches (
    coach_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    gender TEXT,
    mobile TEXT,
    email TEXT,
    academy_id TEXT REFERENCES academies(academy_id),
    role TEXT DEFAULT 'Head Coach',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swimmers table
CREATE TABLE swimmers (
    swimmer_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob TEXT NOT NULL,
    year_of_birth INTEGER,
    age_group TEXT,
    mobile TEXT,
    parent_name TEXT,
    parent_relationship TEXT,
    parent_mobile TEXT NOT NULL,
    parent_email TEXT NOT NULL,
    academy_id TEXT REFERENCES academies(academy_id),
    institution_type TEXT,
    coach_id TEXT REFERENCES coaches(coach_id),
    status TEXT DEFAULT 'Active',
    eligibility TEXT DEFAULT 'Non-Medalist',
    address TEXT DEFAULT '',
    nationality TEXT DEFAULT 'Indian',
    school_name TEXT DEFAULT '',
    school_board TEXT DEFAULT '',
    school_class TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
    tournament_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    venue TEXT,
    start_date TEXT,
    end_date TEXT,
    reg_deadline TEXT,
    fee_per_event REAL DEFAULT 300,
    relay_fee REAL DEFAULT 150,
    gst_rate REAL DEFAULT 0.18,
    lanes INTEGER DEFAULT 8,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    booking_id TEXT PRIMARY KEY,
    swimmer_id TEXT NOT NULL REFERENCES swimmers(swimmer_id),
    tournament_id TEXT NOT NULL REFERENCES tournaments(tournament_id),
    total_fee REAL,
    gst REAL,
    total_paid REAL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'Pending',
    relay_opted INTEGER DEFAULT 0,
    consent_rules INTEGER DEFAULT 0,
    consent_refund INTEGER DEFAULT 0,
    consent_parent INTEGER DEFAULT 0,
    consent_medical INTEGER DEFAULT 0,
    consent_nonmedalist INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event entries table
CREATE TABLE event_entries (
    entry_id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL REFERENCES bookings(booking_id),
    swimmer_id TEXT NOT NULL REFERENCES swimmers(swimmer_id),
    tournament_id TEXT NOT NULL REFERENCES tournaments(tournament_id),
    event_name TEXT NOT NULL,
    event_code TEXT,
    distance TEXT,
    seed_time TEXT DEFAULT 'NT',
    heat_no INTEGER,
    lane_no INTEGER,
    final_time TEXT,
    heat_place INTEGER,
    overall_place INTEGER,
    status TEXT DEFAULT 'Registered',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heat sheets table
CREATE TABLE heat_sheets (
    hs_id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL REFERENCES tournaments(tournament_id),
    event_name TEXT NOT NULL,
    category TEXT,
    gender TEXT,
    heat_no INTEGER,
    lane_no INTEGER,
    swimmer_id TEXT,
    swimmer_name TEXT,
    academy_name TEXT,
    seed_time TEXT,
    start_time TEXT,
    est_completion TEXT
);

-- Disable RLS for all tables (since we use service_role key)
ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swimmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE heat_sheets ENABLE ROW LEVEL SECURITY;

-- Create policies to allow full access with service_role
CREATE POLICY "Allow all for service_role" ON academies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON coaches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON swimmers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON tournaments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON event_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for service_role" ON heat_sheets FOR ALL USING (true) WITH CHECK (true);
"""

def setup():
    """Run the SQL to create tables using Supabase's rpc or postgrest"""
    # We'll use the supabase-py client to execute raw SQL via the rpc endpoint
    # Since supabase-py doesn't support raw SQL directly, we'll use the REST API
    import urllib.request
    import json
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    
    # Alternative: Use the SQL endpoint directly
    # The Supabase Management API requires different auth
    # Instead, let's use the postgrest approach or just print SQL for dashboard
    
    print("=" * 60)
    print("  SUPABASE TABLE SETUP")
    print("=" * 60)
    print()
    print("Please run the following SQL in your Supabase SQL Editor:")
    print("  1. Go to https://supabase.com/dashboard")
    print("  2. Select your project: gacgkcfsjdqikjudqhto")
    print("  3. Click 'SQL Editor' in the left sidebar")
    print("  4. Paste the SQL below and click 'Run'")
    print()
    print("-" * 60)
    print(CREATE_TABLES_SQL)
    print("-" * 60)
    print()
    
    # After tables are created, seed data
    print("\nAfter running the SQL above, run this script again with --seed flag")
    print("to insert default data.")


def seed_data():
    """Insert seed data into Supabase tables"""
    print("Seeding default data...")
    
    # Seed academies
    academies = [
        {'academy_id': 'ACD-001', 'name': 'SRM Swim Club', 'short_name': 'SRM', 'head_coach': 'Coach Pradeep', 'mobile': '+91 98765 11111', 'email': 'srm@swim.in', 'city': 'Chennai', 'address': 'SRM University', 'status': 'Active'},
        {'academy_id': 'ACD-002', 'name': 'Chennai Dolphins', 'short_name': 'CHD', 'head_coach': 'Coach Ramesh', 'mobile': '+91 98765 22222', 'email': 'dolphins@swim.in', 'city': 'Chennai', 'address': 'Velachery Pool', 'status': 'Active'},
        {'academy_id': 'ACD-003', 'name': 'Madurai Marlins', 'short_name': 'MDM', 'head_coach': 'Coach Suresh', 'mobile': '+91 98765 33333', 'email': 'marlins@swim.in', 'city': 'Madurai', 'address': 'Madurai Pool', 'status': 'Active'},
        {'academy_id': 'ACD-004', 'name': 'Kattankulathur Aqua', 'short_name': 'KAQ', 'head_coach': 'Coach Vijay', 'mobile': '+91 98765 44444', 'email': 'aqua@swim.in', 'city': 'Chennai', 'address': 'Kattankulathur', 'status': 'Active'},
        {'academy_id': 'ACD-005', 'name': 'TN Swim Academy', 'short_name': 'TNA', 'head_coach': 'Coach Anand', 'mobile': '+91 98765 55555', 'email': 'tna@swim.in', 'city': 'Chennai', 'address': 'Adyar Pool', 'status': 'Active'},
    ]
    
    result = supabase.table('academies').upsert(academies).execute()
    print(f"  Academies: {len(result.data)} inserted")
    
    # Seed default tournament
    tournament = {
        'tournament_id': 'GNMC-2026',
        'name': 'Golden Non-Medalist Championship 2026',
        'venue': 'SRM University, Kattankulathur, TN 603203',
        'start_date': '2026-06-20',
        'end_date': '2026-06-22',
        'reg_deadline': '2026-05-30',
        'fee_per_event': 300,
        'relay_fee': 150,
        'gst_rate': 0.18,
        'lanes': 8,
        'status': 'Open'
    }
    
    result = supabase.table('tournaments').upsert([tournament]).execute()
    print(f"  Tournaments: {len(result.data)} inserted")
    
    print("\nSeed data inserted successfully!")


if __name__ == '__main__':
    import sys
    if '--seed' in sys.argv:
        seed_data()
    else:
        setup()
