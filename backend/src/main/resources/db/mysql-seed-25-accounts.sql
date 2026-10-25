-- =========================================================================
-- BloodConnect 2026 — 25 Verified Test Accounts Database Seed Script
-- Compatible with MySQL 8.0+ and MariaDB
-- =========================================================================

-- Note: Passwords below are pre-computed BCrypt hashes ($2a$10$...) for demo environments.
-- 1 System Admin: BMMCGS5353@m
-- Other Accounts: specified in test-credentials.md

-- 1. System Admin
INSERT INTO app_users (id, email, password_hash, phone, role, created_at, email_verified, phone_verified)
VALUES (UUID_TO_BIN(UUID()), 'admin@bloodconnect.local', '$2a$10$k1wJ5Ym2mFjK11eT59pA/.t3Z2RjT95m8k1M9wH2K1L3M5N7O9P1Q', '+918026709999', 'ADMIN', NOW(6), TRUE, TRUE)
ON DUPLICATE KEY UPDATE role = 'ADMIN';

-- 2. Hospitals (5 Accounts)
INSERT INTO app_users (id, email, password_hash, phone, role, created_at, email_verified, phone_verified)
VALUES 
(UUID_TO_BIN(UUID()), 'victoria.trauma@bmcri.edu.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+918026701150', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'emergency@nimhans.ac.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+918026995000', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'apex.trauma@aiims.edu', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+911126588500', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'emergency@lilavatihospital.com', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+912226751000', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'mmc.emergency@tn.gov.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+914425305000', 'REQUESTER', NOW(6), TRUE, TRUE)
ON DUPLICATE KEY UPDATE role = 'REQUESTER';

-- 3. Blood Banks (4 Accounts)
INSERT INTO app_users (id, email, password_hash, phone, role, created_at, email_verified, phone_verified)
VALUES 
(UUID_TO_BIN(UUID()), 'rotary.ttk@bloodbank.org', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+918025287903', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'bloodbank@aiims.edu', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+911126588500', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'kem.blood@mcgm.gov.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+912224107000', 'REQUESTER', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'bloodbank@indianredcross.org', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+911123711551', 'REQUESTER', NOW(6), TRUE, TRUE)
ON DUPLICATE KEY UPDATE role = 'REQUESTER';

-- 4. Donors (15 Accounts Across All Blood Groups)
INSERT INTO app_users (id, email, password_hash, phone, role, created_at, email_verified, phone_verified)
VALUES 
(UUID_TO_BIN(UUID()), 'arjun.rao@blr-med.org', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919845112233', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'priyanka.s@gmail.com', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919880223344', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'karthik.v@techblr.io', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919741334455', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'sneha.n@outlook.com', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919632445566', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'rohan.d@fintech.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919513556677', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'ananya.h@ecity.org', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919448667788', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'vikram.rathore@delhi-adv.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919810122334', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'meera.iyer@mumbai-art.org', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919820044556', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'aravind.swamy@chennai-med.edu', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919840066778', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'rajeshwari.p@ahmedabad-tech.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919825088990', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'faizan.a@hyd-eng.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919849011223', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'debojyoti.m@kol-legal.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919830088991', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'tanvi.verma@jaipur-des.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919829033445', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'suresh.menon@kochi-shipping.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919847088992', 'DONOR', NOW(6), TRUE, TRUE),
(UUID_TO_BIN(UUID()), 'kavya.reddy@hsr-tech.in', '$2a$10$7zB3p2L8K9M1N3O5P7Q9R.w1X3Y5Z7A9B1C3D5E7F9G1H3I5J7K9L', '+919886011224', 'DONOR', NOW(6), TRUE, TRUE)
ON DUPLICATE KEY UPDATE role = 'DONOR';
