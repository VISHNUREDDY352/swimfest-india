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
