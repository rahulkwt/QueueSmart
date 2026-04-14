-- =============================================================
-- QueueSmart Test Seed Data
-- Run after migrations: psql -U postgres -d queue_smart_db -f database/seeds/seed.sql
-- Passwords are stored as plain text (no hashing in authController).
-- =============================================================

-- ---------------------------------------------------------------
-- USERS
-- 2 admins + 3 regular users
-- ---------------------------------------------------------------
INSERT INTO users (user_email, user_username, user_password, user_full_name, user_role) VALUES
  ('admin@queuesmart.com',  'admin1',   'Admin1Pass',  'Alice Admin',   'admin'),
  ('admin2@queuesmart.com', 'admin2',   'Admin2Pass',  'Bob Admin',     'admin'),
  ('john@example.com',      'johndoe',  'John1234',    'John Doe',      'user'),
  ('jane@example.com',      'janedoe',  'Jane1234',    'Jane Doe',      'user'),
  ('sam@example.com',       'samsmith', 'Sam1234',     'Sam Smith',     'user');

-- ---------------------------------------------------------------
-- SERVICES
-- ---------------------------------------------------------------
INSERT INTO services (service_name, service_description, service_duration, service_is_deleted) VALUES
  ('General Consultation',  'Standard check-up and general medical consultation',   15,  FALSE),
  ('Emergency Care',        'Immediate care for urgent medical conditions',         10,  FALSE),
  ('Lab Tests',             'Blood work, urinalysis, and other diagnostic tests',   20,  FALSE),
  ('Vaccination',           'Routine and travel vaccinations',                      10,  FALSE),
  ('Specialist Referral',   'Referral appointments with specialist doctors',        30,  TRUE);  -- soft-deleted service

-- ---------------------------------------------------------------
-- QUEUES
-- Each queue is tied to a service
-- ---------------------------------------------------------------
INSERT INTO queue (queue_name, service_id, estimated_time, is_deleted) VALUES
  ('General Consultation Queue',  1, 15,  FALSE),
  ('Emergency Care Queue',        2, 10,  FALSE),
  ('Lab Tests Queue',             3, 20,  FALSE),
  ('Vaccination Queue',           4, 10,  FALSE),
  ('Old Specialist Queue',        1, 30,  TRUE);  -- soft-deleted queue

-- ---------------------------------------------------------------
-- QUEUE ENTRIES
-- Completed/cancelled rows are inserted in bulk (no history link needed —
-- their statuses will never change). Pending rows each get a matching
-- pending history record via a CTE so the backend can update history
-- correctly when the entry is served, removed, or left.
-- ---------------------------------------------------------------
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority) VALUES
  -- General Consultation Queue (queue_id=1, service_id=1) — completed
  (1, 1, 3, 'completed', 1, 'high'),
  (1, 1, 4, 'completed', 2, 'mid'),

  -- Emergency Care Queue (queue_id=2, service_id=2) — completed/cancelled
  (2, 2, 4, 'completed', 1, 'high'),
  (2, 2, 4, 'cancelled', 3, 'low'),

  -- Vaccination Queue (queue_id=4, service_id=4) — cancelled
  (4, 4, 4, 'cancelled', 1, 'low');

-- Pending entries: each CTE inserts a history row and passes its ID to
-- the queue_entry insert so they are properly linked from the start.

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (3, 1, 'General Consultation', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 1, 1, 3, 'pending', 3, 'low', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (5, 1, 'General Consultation', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 1, 1, 5, 'pending', 4, 'low', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (5, 2, 'Emergency Care', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 2, 2, 5, 'pending', 2, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (5, 3, 'Lab Tests', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 3, 3, 5, 'pending', 1, 'high', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (3, 3, 'Lab Tests', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 3, 3, 3, 'pending', 2, 'mid', history_id FROM h;

-- ---------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------
INSERT INTO notifications (user_id, notif_message, notif_status) VALUES
  -- Notifications for John (user_id=3)
  (3, 'Your position in the General Consultation Queue is now #3.',  'unread'),
  (3, 'Your appointment has been completed. Thank you!',             'read'),

  -- Notifications for Jane (user_id=4)
  (4, 'You have joined the Emergency Care Queue at position #2.',    'unread'),
  (4, 'Your Emergency Care Queue entry was cancelled.',              'read'),

  -- Notifications for Sam (user_id=5)
  (5, 'You are next in the General Consultation Queue.',             'unread'),

  -- Notification for admin
  (1, 'New user registered: johndoe.',                              'read');

-- ---------------------------------------------------------------
-- HISTORY
-- Tracks queue participation: status is pending | completed | cancelled
-- history_service_name stores the service name at the time of joining
-- history_notes is optional (e.g. staff remarks)
-- ---------------------------------------------------------------
-- Completed/cancelled history from previous visits (not linked to any current queue entry).
-- Pending history entries are created alongside their queue entries in the CTEs above.
INSERT INTO history (user_id, service_id, history_service_name, history_notes, history_status) VALUES
  -- John's past visits
  (3, 1, 'General Consultation', NULL,                 'completed'),
  (3, 3, 'Lab Tests',            NULL,                 'completed'),

  -- Jane's past visits
  (4, 2, 'Emergency Care',       NULL,                 'completed'),
  (4, 4, 'Vaccination',          NULL,                 'cancelled'),

  -- Admin history
  (1, 1, 'General Consultation', 'Admin test entry.',  'completed');
