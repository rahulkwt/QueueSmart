-- =============================================================
-- QueueSmart Test Seed Data
-- Run after migrations: psql -U postgres -d queue_smart_db -f database/seeds/seed.sql
-- Passwords are stored as plain text (no hashing in authController).
-- =============================================================

-- ---------------------------------------------------------------
-- USERS
-- 5 admins (user_id 1-5) + 45 regular users (user_id 6-50)
-- ---------------------------------------------------------------
INSERT INTO users (user_email, user_username, user_password, user_full_name, user_role) VALUES
  -- Admins
  ('admin1@queuesmart.com',  'admin1',     'Admin1Pass',  'Alice Johnson',     'admin'),
  ('admin2@queuesmart.com',  'admin2',     'Admin2Pass',  'Bob Martinez',      'admin'),
  ('admin3@queuesmart.com',  'admin3',     'Admin3Pass',  'Carol Nguyen',      'admin'),
  ('admin4@queuesmart.com',  'admin4',     'Admin4Pass',  'David Patel',       'admin'),
  ('admin5@queuesmart.com',  'admin5',     'Admin5Pass',  'Emma Williams',     'admin'),
  -- Regular users
  ('john.doe@example.com',          'johndoe',     'John1234',     'John Doe',           'user'),
  ('jane.smith@example.com',        'janesmith',   'Jane1234',     'Jane Smith',         'user'),
  ('samuel.brown@example.com',      'sambrown',    'Sam1234',      'Samuel Brown',       'user'),
  ('olivia.garcia@example.com',     'oliviag',     'Olivia1234',   'Olivia Garcia',      'user'),
  ('liam.miller@example.com',       'liammiller',  'Liam1234',     'Liam Miller',        'user'),
  ('sophia.davis@example.com',      'sophiad',     'Sophia1234',   'Sophia Davis',       'user'),
  ('noah.rodriguez@example.com',    'noahr',       'Noah1234',     'Noah Rodriguez',     'user'),
  ('ava.martinez@example.com',      'avam',        'Ava1234',      'Ava Martinez',       'user'),
  ('ethan.hernandez@example.com',   'ethanh',      'Ethan1234',    'Ethan Hernandez',    'user'),
  ('mia.lopez@example.com',         'mialopez',    'Mia1234',      'Mia Lopez',          'user'),
  ('lucas.gonzalez@example.com',    'lucasg',      'Lucas1234',    'Lucas Gonzalez',     'user'),
  ('isabella.wilson@example.com',   'isabellaw',   'Bella1234',    'Isabella Wilson',    'user'),
  ('mason.anderson@example.com',    'masona',      'Mason1234',    'Mason Anderson',     'user'),
  ('amelia.thomas@example.com',     'ameliat',     'Amelia1234',   'Amelia Thomas',      'user'),
  ('james.taylor@example.com',      'jamest',      'James1234',    'James Taylor',       'user'),
  ('charlotte.moore@example.com',   'charlottem',  'Charl1234',    'Charlotte Moore',    'user'),
  ('benjamin.jackson@example.com',  'benjaminj',   'Ben1234',      'Benjamin Jackson',   'user'),
  ('harper.white@example.com',      'harperw',     'Harper1234',   'Harper White',       'user'),
  ('elijah.harris@example.com',     'elijahh',     'Elijah1234',   'Elijah Harris',      'user'),
  ('evelyn.clark@example.com',      'evelync',     'Evelyn1234',   'Evelyn Clark',       'user'),
  ('william.lewis@example.com',     'williaml',    'Will1234',     'William Lewis',      'user'),
  ('abigail.walker@example.com',    'abigailw',    'Abi1234',      'Abigail Walker',     'user'),
  ('henry.hall@example.com',        'henryh',      'Henry1234',    'Henry Hall',         'user'),
  ('emily.allen@example.com',       'emilya',      'Emily1234',    'Emily Allen',        'user'),
  ('alexander.young@example.com',   'alexy',       'Alex1234',     'Alexander Young',    'user'),
  ('ella.king@example.com',         'ellak',       'Ella1234',     'Ella King',          'user'),
  ('michael.wright@example.com',    'michaelw',    'Mike1234',     'Michael Wright',     'user'),
  ('avery.scott@example.com',       'averys',      'Avery1234',    'Avery Scott',        'user'),
  ('daniel.green@example.com',      'danielg',     'Daniel1234',   'Daniel Green',       'user'),
  ('madison.adams@example.com',     'madisona',    'Maddy1234',    'Madison Adams',      'user'),
  ('matthew.baker@example.com',     'matthewb',    'Matt1234',     'Matthew Baker',      'user'),
  ('scarlett.nelson@example.com',   'scarlettn',   'Scar1234',     'Scarlett Nelson',    'user'),
  ('joseph.carter@example.com',     'josephc',     'Joe1234',      'Joseph Carter',      'user'),
  ('grace.mitchell@example.com',    'gracem',      'Grace1234',    'Grace Mitchell',     'user'),
  ('david.perez@example.com',       'davidp',      'David1234',    'David Perez',        'user'),
  ('chloe.roberts@example.com',     'chloer',      'Chloe1234',    'Chloe Roberts',      'user'),
  ('logan.turner@example.com',      'logant',      'Logan1234',    'Logan Turner',       'user'),
  ('zoe.phillips@example.com',      'zoep',        'Zoe1234',      'Zoe Phillips',       'user'),
  ('owen.campbell@example.com',     'owenc',       'Owen1234',     'Owen Campbell',      'user'),
  ('lily.parker@example.com',       'lilyp',       'Lily1234',     'Lily Parker',        'user'),
  ('wyatt.evans@example.com',       'wyatte',      'Wyatt1234',    'Wyatt Evans',        'user'),
  ('hannah.edwards@example.com',    'hannahe',     'Hannah1234',   'Hannah Edwards',     'user'),
  ('jack.collins@example.com',      'jackc',       'Jack1234',     'Jack Collins',       'user'),
  ('layla.stewart@example.com',     'laylas',      'Layla1234',    'Layla Stewart',      'user'),
  ('carter.morris@example.com',     'carterm',     'Carter1234',   'Carter Morris',      'user');

-- ---------------------------------------------------------------
-- SERVICES
-- 9 active + 1 soft-deleted
-- ---------------------------------------------------------------
INSERT INTO services (service_name, service_description, service_duration, service_is_deleted) VALUES
  ('General Consultation',     'Standard check-up and general medical consultation',         15,  FALSE),
  ('Emergency Care',           'Immediate care for urgent medical conditions',               10,  FALSE),
  ('Lab Tests',                'Blood work, urinalysis, and other diagnostic tests',         20,  FALSE),
  ('Vaccination',              'Routine and travel vaccinations',                            10,  FALSE),
  ('Pediatric Care',           'Medical care and check-ups for children',                    20,  FALSE),
  ('Dental Checkup',           'Routine dental examination and cleaning',                    25,  FALSE),
  ('X-Ray Imaging',            'Diagnostic imaging for bones and chest',                     15,  FALSE),
  ('Pharmacy Pickup',          'Prescription pickup and medication counseling',               5,  FALSE),
  ('Physical Therapy',         'Rehabilitation and physical therapy sessions',               30,  FALSE),
  ('Specialist Referral',      'Referral appointments with specialist doctors',              30,  TRUE);  -- soft-deleted

-- ---------------------------------------------------------------
-- QUEUES
-- One queue per active service, plus one soft-deleted queue
-- ---------------------------------------------------------------
INSERT INTO queue (queue_name, service_id, estimated_time, is_deleted) VALUES
  ('General Consultation Queue',  1,  15,  FALSE),
  ('Emergency Care Queue',        2,  10,  FALSE),
  ('Lab Tests Queue',             3,  20,  FALSE),
  ('Vaccination Queue',           4,  10,  FALSE),
  ('Pediatric Care Queue',        5,  20,  FALSE),
  ('Dental Checkup Queue',        6,  25,  FALSE),
  ('X-Ray Imaging Queue',         7,  15,  FALSE),
  ('Pharmacy Pickup Queue',       8,   5,  FALSE),
  ('Physical Therapy Queue',      9,  30,  FALSE),
  ('Old Specialist Queue',        1,  30,  TRUE);  -- soft-deleted

-- ---------------------------------------------------------------
-- QUEUE ENTRIES
-- Completed/cancelled rows are inserted in bulk (no history link needed —
-- their statuses will never change). Pending rows each get a matching
-- pending history record via a CTE so the backend can update history
-- correctly when the entry is served, removed, or left.
-- ---------------------------------------------------------------
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority) VALUES
  -- General Consultation Queue (queue_id=1)
  (1, 1, 6,  'completed', 1, 'high'),
  (1, 1, 7,  'completed', 2, 'mid'),
  (1, 1, 8,  'completed', 3, 'low'),
  (1, 1, 25, 'cancelled', 4, 'low'),

  -- Emergency Care Queue (queue_id=2)
  (2, 2, 7,  'completed', 1, 'high'),
  (2, 2, 9,  'completed', 2, 'high'),
  (2, 2, 12, 'cancelled', 3, 'low'),

  -- Lab Tests Queue (queue_id=3)
  (3, 3, 6,  'completed', 1, 'mid'),
  (3, 3, 10, 'completed', 2, 'low'),

  -- Vaccination Queue (queue_id=4)
  (4, 4, 11, 'completed', 1, 'mid'),
  (4, 4, 14, 'cancelled', 2, 'low'),

  -- Pediatric Care Queue (queue_id=5)
  (5, 5, 13, 'completed', 1, 'mid'),
  (5, 5, 15, 'completed', 2, 'low'),

  -- Dental Checkup Queue (queue_id=6)
  (6, 6, 16, 'completed', 1, 'mid'),

  -- X-Ray Imaging Queue (queue_id=7)
  (7, 7, 17, 'completed', 1, 'high'),
  (7, 7, 19, 'cancelled', 2, 'low'),

  -- Pharmacy Pickup Queue (queue_id=8)
  (8, 8, 18, 'completed', 1, 'low'),
  (8, 8, 22, 'completed', 2, 'low'),

  -- Physical Therapy Queue (queue_id=9)
  (9, 9, 20, 'completed', 1, 'mid');

-- Pending entries: each CTE inserts a history row and passes its ID to
-- the queue_entry insert so they are properly linked from the start.

-- General Consultation Queue (queue_id=1) — pending positions 5-8
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (6, 1, 'General Consultation', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 1, 1, 6, 'pending', 5, 'low', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (21, 1, 'General Consultation', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 1, 1, 21, 'pending', 6, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (30, 1, 'General Consultation', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 1, 1, 30, 'pending', 7, 'low', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (35, 1, 'General Consultation', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 1, 1, 35, 'pending', 8, 'low', history_id FROM h;

-- Emergency Care Queue (queue_id=2) — pending positions 4-6
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (23, 2, 'Emergency Care', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 2, 2, 23, 'pending', 4, 'high', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (31, 2, 'Emergency Care', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 2, 2, 31, 'pending', 5, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (40, 2, 'Emergency Care', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 2, 2, 40, 'pending', 6, 'low', history_id FROM h;

-- Lab Tests Queue (queue_id=3) — pending positions 3-5
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (24, 3, 'Lab Tests', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 3, 3, 24, 'pending', 3, 'high', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (26, 3, 'Lab Tests', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 3, 3, 26, 'pending', 4, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (32, 3, 'Lab Tests', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 3, 3, 32, 'pending', 5, 'low', history_id FROM h;

-- Vaccination Queue (queue_id=4) — pending positions 3-4
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (27, 4, 'Vaccination', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 4, 4, 27, 'pending', 3, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (41, 4, 'Vaccination', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 4, 4, 41, 'pending', 4, 'low', history_id FROM h;

-- Pediatric Care Queue (queue_id=5) — pending positions 3-4
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (28, 5, 'Pediatric Care', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 5, 5, 28, 'pending', 3, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (33, 5, 'Pediatric Care', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 5, 5, 33, 'pending', 4, 'low', history_id FROM h;

-- Dental Checkup Queue (queue_id=6) — pending positions 2-3
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (29, 6, 'Dental Checkup', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 6, 6, 29, 'pending', 2, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (38, 6, 'Dental Checkup', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 6, 6, 38, 'pending', 3, 'low', history_id FROM h;

-- X-Ray Imaging Queue (queue_id=7) — pending positions 3-4
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (36, 7, 'X-Ray Imaging', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 7, 7, 36, 'pending', 3, 'high', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (44, 7, 'X-Ray Imaging', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 7, 7, 44, 'pending', 4, 'low', history_id FROM h;

-- Pharmacy Pickup Queue (queue_id=8) — pending positions 3-5
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (34, 8, 'Pharmacy Pickup', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 8, 8, 34, 'pending', 3, 'low', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (39, 8, 'Pharmacy Pickup', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 8, 8, 39, 'pending', 4, 'low', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (42, 8, 'Pharmacy Pickup', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 8, 8, 42, 'pending', 5, 'low', history_id FROM h;

-- Physical Therapy Queue (queue_id=9) — pending positions 2-3
WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (37, 9, 'Physical Therapy', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 9, 9, 37, 'pending', 2, 'mid', history_id FROM h;

WITH h AS (
  INSERT INTO history (user_id, service_id, history_service_name, history_status)
  VALUES (43, 9, 'Physical Therapy', 'pending') RETURNING history_id
)
INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
SELECT 9, 9, 43, 'pending', 3, 'low', history_id FROM h;

-- ---------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------
INSERT INTO notifications (user_id, notif_message, notif_status) VALUES
  -- John Doe (user_id=6)
  (6,  'Your position in the General Consultation Queue is now #5.',  'unread'),
  (6,  'Your Lab Tests appointment has been completed. Thank you!',   'read'),

  -- Jane Smith (user_id=7)
  (7,  'You have joined the Emergency Care Queue at position #2.',    'read'),
  (7,  'Your General Consultation appointment is complete.',          'read'),

  -- Sam Brown (user_id=8)
  (8,  'You are next in the General Consultation Queue.',             'unread'),

  -- Olivia Garcia (user_id=9)
  (9,  'Your Emergency Care visit has been completed.',               'read'),

  -- Liam Miller (user_id=10)
  (10, 'Your Lab Tests results are ready. Please consult staff.',     'unread'),

  -- Isabella Wilson (user_id=13) — pediatric
  (13, 'Pediatric Care appointment marked complete.',                 'read'),

  -- Mason Anderson (user_id=14) — vaccination cancelled
  (14, 'Your Vaccination Queue entry was cancelled.',                 'read'),

  -- Charlotte Moore (user_id=16) — dental
  (16, 'Dental Checkup completed. Next visit recommended in 6 mo.',   'read'),

  -- Benjamin Jackson (user_id=17) — x-ray
  (17, 'X-Ray Imaging complete. Results sent to your physician.',     'unread'),

  -- Pending entry notifications
  (21, 'You joined the General Consultation Queue at position #6.',   'unread'),
  (23, 'You joined the Emergency Care Queue at position #4.',         'unread'),
  (24, 'You joined the Lab Tests Queue at position #3.',              'unread'),
  (27, 'You joined the Vaccination Queue at position #3.',            'unread'),
  (28, 'You joined the Pediatric Care Queue at position #3.',         'unread'),
  (29, 'You joined the Dental Checkup Queue at position #2.',         'unread'),
  (30, 'Your wait time in General Consultation is approx. 30 min.',   'unread'),
  (34, 'Your prescription is ready for pickup at the Pharmacy.',      'unread'),
  (36, 'X-Ray Imaging Queue: you are 3rd in line.',                   'unread'),
  (37, 'Physical Therapy session reminder: please arrive 5 min early.', 'unread'),
  (40, 'Emergency Care Queue: you are at position #6.',               'read'),
  (44, 'X-Ray Imaging: please confirm your appointment time.',        'unread'),

  -- Admin notifications
  (1,  'New user registered: johndoe.',                               'read'),
  (1,  'Daily report: 9 active queues, 22 pending entries.',          'unread'),
  (2,  'New user registered: laylas.',                                'unread'),
  (3,  'Service "Specialist Referral" was soft-deleted.',             'read');

-- ---------------------------------------------------------------
-- HISTORY
-- Tracks queue participation: status is pending | completed | cancelled
-- history_service_name stores the service name at the time of joining
-- history_notes is optional (e.g. staff remarks)
-- ---------------------------------------------------------------
-- Completed/cancelled history from previous visits (not linked to any current queue entry).
-- Pending history entries are created alongside their queue entries in the CTEs above.
INSERT INTO history (user_id, service_id, history_service_name, history_notes, history_status) VALUES
  -- John Doe past visits
  (6,  1, 'General Consultation', NULL,                                    'completed'),
  (6,  3, 'Lab Tests',            'Routine bloodwork, all normal.',        'completed'),

  -- Jane Smith past visits
  (7,  2, 'Emergency Care',       'Treated for minor laceration.',         'completed'),
  (7,  4, 'Vaccination',          NULL,                                    'cancelled'),

  -- Samuel Brown past visits
  (8,  1, 'General Consultation', NULL,                                    'completed'),
  (8,  6, 'Dental Checkup',       'Cleaning, no cavities.',                'completed'),

  -- Olivia Garcia past visits
  (9,  2, 'Emergency Care',       NULL,                                    'completed'),

  -- Liam Miller past visits
  (10, 3, 'Lab Tests',            NULL,                                    'completed'),
  (10, 7, 'X-Ray Imaging',        'Wrist x-ray, no fracture.',             'completed'),

  -- Sophia Davis (user_id=11)
  (11, 4, 'Vaccination',          'Flu shot administered.',                'completed'),

  -- Noah Rodriguez (user_id=12)
  (12, 2, 'Emergency Care',       NULL,                                    'cancelled'),

  -- Ava Martinez (user_id=13)
  (13, 5, 'Pediatric Care',       'Annual well-child visit.',              'completed'),

  -- Ethan Hernandez (user_id=14)
  (14, 4, 'Vaccination',          NULL,                                    'cancelled'),

  -- Mia Lopez (user_id=15)
  (15, 5, 'Pediatric Care',       NULL,                                    'completed'),

  -- Lucas Gonzalez (user_id=16)
  (16, 6, 'Dental Checkup',       NULL,                                    'completed'),

  -- Isabella Wilson (user_id=17)
  (17, 7, 'X-Ray Imaging',        'Chest x-ray, clear.',                   'completed'),

  -- Mason Anderson (user_id=18)
  (18, 8, 'Pharmacy Pickup',      NULL,                                    'completed'),

  -- Amelia Thomas (user_id=19)
  (19, 7, 'X-Ray Imaging',        NULL,                                    'cancelled'),

  -- James Taylor (user_id=20)
  (20, 9, 'Physical Therapy',     'Knee rehab session 4 of 8.',            'completed'),

  -- Charlotte Moore (user_id=22)
  (22, 8, 'Pharmacy Pickup',      NULL,                                    'completed'),

  -- Older general consultation visits across users
  (25, 1, 'General Consultation', NULL,                                    'cancelled'),
  (15, 1, 'General Consultation', 'Patient rescheduled.',                  'cancelled'),
  (45, 9, 'Physical Therapy',     'Shoulder rehab, progressing well.',     'completed'),
  (50, 6, 'Dental Checkup',       NULL,                                    'completed'),

  -- Admin history
  (1,  1, 'General Consultation', 'Admin test entry.',                     'completed');
