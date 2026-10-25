CREATE TABLE app_users (
    id BINARY(16) NOT NULL,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    phone_verified BOOLEAN NOT NULL DEFAULT TRUE,
    email_otp_hash VARCHAR(60) NULL,
    phone_otp_hash VARCHAR(60) NULL,
    otp_expires_at DATETIME(6) NULL,
    otp_sent_at DATETIME(6) NULL,
    otp_attempts INT NOT NULL DEFAULT 0,
    otp_resends INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE donor_profiles (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    blood_group VARCHAR(3) NOT NULL,
    location VARCHAR(160) NOT NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    available BOOLEAN NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_donor_profiles_user (user_id),
    CONSTRAINT fk_donor_profiles_user FOREIGN KEY (user_id) REFERENCES app_users (id)
) ENGINE=InnoDB;

CREATE TABLE blood_requests (
    id BINARY(16) NOT NULL,
    requester_id BINARY(16) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(3) NOT NULL,
    units INT NOT NULL,
    hospital VARCHAR(120) NOT NULL,
    location VARCHAR(160) NOT NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    urgency VARCHAR(16) NOT NULL,
    contact VARCHAR(30) NOT NULL,
    message VARCHAR(1000) NULL,
    status VARCHAR(16) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_blood_requests_requester (requester_id),
    CONSTRAINT fk_blood_requests_requester FOREIGN KEY (requester_id) REFERENCES app_users (id)
) ENGINE=InnoDB;
