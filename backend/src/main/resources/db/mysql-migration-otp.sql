ALTER TABLE app_users
    ADD COLUMN phone VARCHAR(30) NULL AFTER password_hash,
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN email_otp_hash VARCHAR(60) NULL,
    ADD COLUMN phone_otp_hash VARCHAR(60) NULL,
    ADD COLUMN otp_expires_at DATETIME(6) NULL,
    ADD COLUMN otp_sent_at DATETIME(6) NULL,
    ADD COLUMN otp_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN otp_resends INT NOT NULL DEFAULT 0;

UPDATE app_users AS users
JOIN donor_profiles AS donors ON donors.user_id = users.id
SET users.phone = donors.phone
WHERE users.phone IS NULL;
