-- Single active session enforcement for customer accounts.
-- Stores the token of the one allowed active session per user.
-- active_session_at is a heartbeat: the active client updates it
-- periodically so stale sessions (crashed browser) can be detected.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active_session_at TIMESTAMPTZ;
