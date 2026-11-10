-- Carving Dezine: Client Portal hardening. Run ONCE in the Neon SQL editor,
-- AFTER 001_client_portal.sql. Safe to run again (IF NOT EXISTS everywhere).

-- brute-force protection: 5 wrong PINs locks the link for 15 minutes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS locked_until    TIMESTAMPTZ;

-- shown in your workspace: when did the client last open their portal
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_viewed_at  TIMESTAMPTZ;
ALTER TABLE client_files ADD COLUMN IF NOT EXISTS viewed_at  TIMESTAMPTZ;
