-- Run this in Supabase SQL Editor to add password_hash column
ALTER TABLE swimmers ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL;
