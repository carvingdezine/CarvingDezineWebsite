-- Carving Dezine — Client Portal schema
-- Run this once against your existing Postgres (Neon) database.
-- Assumes the same DB your /api/projects function already uses.

CREATE TABLE IF NOT EXISTS clients (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT,
  access_token  TEXT UNIQUE NOT NULL,   -- long random string, part of the magic link
  pin           TEXT NOT NULL,          -- 6-digit PIN, shared with the client via a SEPARATE channel than the link
  notes         TEXT,                   -- private admin-only notes about this client
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If you already ran an earlier version of this schema without the pin column, run:
-- ALTER TABLE clients ADD COLUMN IF NOT EXISTS pin TEXT NOT NULL DEFAULT '000000';

CREATE TABLE IF NOT EXISTS client_files (
  id            SERIAL PRIMARY KEY,
  client_id     INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,          -- display name, e.g. "Invoice #014.pdf"
  file_type     TEXT NOT NULL DEFAULT 'file', -- 'invoice' | 'sow' | 'deliverable' | 'file'
  drive_url     TEXT NOT NULL,          -- Google Drive share link ("Anyone with the link" access)
  status        TEXT NOT NULL DEFAULT 'sent', -- 'sent' | 'viewed'
                                          -- payment_status left out deliberately for now —
                                          -- add later as: payment_status TEXT DEFAULT 'unpaid'
                                          -- when a real payment gateway is wired up
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optional: lets a portfolio project be tied to a client and stay unpublished
-- until you're ready. Only run this if your existing `projects` table doesn't
-- already have a `status` column — check first, this is additive.
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id);

CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_access_token ON clients(access_token);
