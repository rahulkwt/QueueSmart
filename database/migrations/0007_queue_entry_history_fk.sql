-- Link queue_entry rows to their corresponding history record.
-- Populated by joinQueue when a user joins; used by serveNext, removeFromQueue,
-- and leaveQueue to update history status without relying on the frontend.
-- Nullable so existing/seed rows that pre-date this migration are unaffected.
ALTER TABLE queue_entry
    ADD COLUMN IF NOT EXISTS history_id INTEGER REFERENCES history(history_id);
