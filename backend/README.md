# BloodConnect

BloodConnect is a Java 25 / Spring Boot API with a static HTML frontend. It supports account registration and login, donor profiles and availability, emergency blood requests, compatible donor search, distance-based ranking, and request status updates.

## Requirements

- JDK 25 or newer
- Apache Maven 3.9+
- MySQL 8+ for a persistent deployment (optional for local development)

## Configure

## Run Locally

The `local` profile uses an in-memory H2 database and creates tables automatically. From the project root, start the API:

```powershell
mvn -f backend/pom.xml '-Dspring-boot.run.profiles=local' '-Dspring-boot.run.arguments=--server.port=8081' spring-boot:run
```

An optional local admin account is provisioned at startup when `BLOODCONNECT_ADMIN_PASSWORD` is set in the environment. Its email defaults to `admin@bloodconnect.local` and can be changed with `BLOODCONNECT_ADMIN_EMAIL`. The password is BCrypt-hashed; it is not stored in project files. Public registration cannot create admin accounts. Admins can view registered email, role, and creation time, but never passwords.

## Email And Phone Verification

New accounts remain unable to log in until both email and phone OTPs are verified. Registration requires a phone number in international E.164 format, such as `+14155550123`. Codes are six digits, expire after ten minutes by default, and are stored only as BCrypt hashes. Verification is limited to five attempts; resend requests have a one-minute cooldown and a maximum of three resends.

Configure delivery before accepting registrations:

- `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` for SendGrid email.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` for Twilio SMS.
- Optional policy settings: `OTP_EXPIRATION` (Spring duration), `OTP_RESEND_COOLDOWN`, `OTP_MAX_ATTEMPTS`, and `OTP_MAX_RESENDS`.

`POST /api/auth/register` starts verification and returns no access token. `POST /api/auth/verify-otp` accepts `email`, `emailCode`, and `phoneCode`, and returns the access token only after both codes verify. `POST /api/auth/resend-otp` requests replacement codes. Aadhaar authentication is not enabled until an authorized verification provider and its sandbox/API documentation are identified.

In a second PowerShell terminal, serve the frontend:

```powershell
python -m http.server 5500 --directory frontend
```

Open `http://localhost:5500`. Register a donor account and a requester account in separate browser sessions (or use a private window for the second account). The H2 database is in memory and is cleared when the backend stops. Browser location access requires localhost or HTTPS; if declined, profiles still work but ranking cannot calculate a distance.

Run the tests with:

```powershell
mvn -f backend/pom.xml test
```

## MySQL Deployment

Set these environment variables before starting against MySQL:

- `DB_URL`: JDBC URL, default `jdbc:mysql://localhost:3306/bloodconnect?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
- `DB_USERNAME`: MySQL username
- `DB_PASSWORD`: MySQL password
- `JWT_SECRET`: Base64-encoded random secret of at least 256 bits
- `JWT_EXPIRATION`: token lifetime as a Spring duration, default `PT1H`
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins, defaults to localhost ports 3000 and 5173

Generate a signing secret with PowerShell:

```powershell
$bytes = [byte[]]::new(32)
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Create the `bloodconnect` database and apply [`src/main/resources/db/mysql-schema.sql`](src/main/resources/db/mysql-schema.sql) before startup. For an existing deployment, apply [`src/main/resources/db/mysql-migration-otp.sql`](src/main/resources/db/mysql-migration-otp.sql) once before upgrading; it preserves existing accounts as verified and copies donor phone values into the account record. The default profile uses `spring.jpa.hibernate.ddl-auto=validate`; it will not alter a deployment schema. Keep `JWT_SECRET` private and replace the local-only signing key in deployed environments.

## Authentication API

`POST /api/auth/register`

```json
{"email":"donor@example.com","password":"a-long-password","role":"DONOR"}
```

Allowed roles are `DONOR` and `REQUESTER`. Registration returns `201 Created` with a bearer token and a password-free user object. Passwords are BCrypt hashed; passwords longer than 72 UTF-8 bytes are rejected. Send the token to protected endpoints using `Authorization: Bearer <accessToken>`.

`POST /api/auth/login`

```json
{"email":"donor@example.com","password":"a-long-password"}
```

Returns the same token response shape. Send the token to protected endpoints using `Authorization: Bearer <accessToken>`.

`GET /api/auth/me` returns the authenticated user's id, email, role, and creation time. Authentication is stateless; logout on the client by discarding the token.

## Donor And Matching API

All routes below require a bearer token and role authorization.

- `PUT /api/donors/me`: create or update the signed-in donor's name, phone, blood group, location, optional latitude/longitude, and availability.
- `GET /api/donors/me`: retrieve the signed-in donor profile.
- `PATCH /api/donors/me/availability`: set `{"available":false}` or `true`.
- `GET /api/donors/nearby?bloodGroup=A%2B&latitude=12.97&longitude=77.59`: list available compatible donors, sorted by distance when coordinates exist.
- `POST /api/requests`: create an emergency request as a `REQUESTER`; returns its UUID and `OPEN` status.
- `GET /api/requests/{id}`: retrieve a request owned by the signed-in requester.
- `GET /api/requests/{id}/matches`: list compatible, available donors ranked by distance and priority score. Donor phone numbers are not included.
- `PATCH /api/requests/{id}/status`: set `OPEN`, `FULFILLED`, or `CANCELLED`.

Compatibility is based on standard red-cell ABO/Rh donor-to-recipient rules. Distances use the Haversine formula on browser-provided coordinates. This matching list is informational only and is not medical advice; a qualified clinician or blood bank must confirm transfusion suitability. Donor response notifications and contact workflows are not implemented.
