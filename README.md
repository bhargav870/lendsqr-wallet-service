# Demo Credit Wallet Service

This is a Minimum Viable Product wallet API for Demo Credit. Borrowers can create an account, receive loan disbursement into their wallet, transfer funds to another user, and withdraw funds. During onboarding, the service checks the user's identity against Lendsqr Adjutor Karma before creating the wallet.

## Live service

Replace this after deployment:

```text
https://<candidate-name>-lendsqr-be-test.<cloud-platform-domain>
```

## GitHub repository

Replace this after pushing the code:

```text
https://github.com/<github-username>/lendsqr-wallet-service
```

## Tech stack

- Node.js LTS
- TypeScript
- Express.js
- Knex.js ORM
- MySQL 8
- Jest
- Lendsqr Adjutor Karma API

## Main features

- Create a user account and wallet.
- Block onboarding when the user identity is found on Lendsqr Karma blacklist.
- Fund a user's wallet.
- Transfer funds from one user wallet to another.
- Withdraw funds from a wallet.
- Store all wallet movements as transaction records.
- Use database transactions for fund, transfer, and withdrawal operations.
- Use row locking during balance updates to reduce race conditions.
- Use faux bearer-token authentication for protected endpoints.
- Include unit tests for positive and negative scenarios.

## Architecture approach

The project uses a small layered architecture:

```text
HTTP Request
  -> Route
  -> Validation middleware
  -> Controller
  -> Service
  -> Knex transaction/query
  -> MySQL database
```

Controllers only handle request and response flow. Business rules are placed in services. Database operations that change money are wrapped in `knex.transaction()` so the full operation either succeeds together or rolls back together.

The transfer flow updates the sender wallet, receiver wallet, and transaction table inside one transaction. This prevents cases where money is debited without being credited, or credited without a transaction record.

## ER diagram

```mermaid
erDiagram
    USERS ||--|| WALLETS : owns
    WALLETS ||--o{ TRANSACTIONS : source_wallet
    WALLETS ||--o{ TRANSACTIONS : destination_wallet

    USERS {
        int id PK
        string public_id UK
        string first_name
        string last_name
        string email UK
        string phone UK
        string bvn UK
        timestamp created_at
        timestamp updated_at
    }

    WALLETS {
        int id PK
        int user_id FK
        decimal balance
        string currency
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        int id PK
        string reference UK
        enum type
        enum status
        int source_wallet_id FK
        int destination_wallet_id FK
        decimal amount
        decimal balance_before
        decimal balance_after
        string description
        json metadata
        timestamp created_at
        timestamp updated_at
    }
```

## Database design

### users

Stores customer identity data needed for onboarding and Karma lookup.

Important constraints:

- `email` is unique.
- `phone` is unique when provided.
- `bvn` is unique when provided.
- `public_id` is exposed through API instead of internal database id.

### wallets

Stores one wallet per user.

Important constraints:

- `user_id` is unique so a user cannot have multiple wallets in this MVP.
- `balance` is stored as `DECIMAL(18,2)` to avoid floating-point money errors.

### transactions

Stores audit records for all money movement.

Important constraints:

- `reference` is unique.
- `type` is one of `FUND`, `TRANSFER`, or `WITHDRAWAL`.
- `source_wallet_id` is nullable for funding.
- `destination_wallet_id` is nullable for withdrawal.

## Lendsqr Adjutor Karma integration

On user creation, the API checks available identities in this order:

- email
- phone
- BVN

If any identity is found in Karma, onboarding is rejected with `403 KARMA_BLACKLISTED`.

Karma endpoint used:

```text
GET /verification/karma/:identity
```

Base URL used by default:

```text
https://adjutor.lendsqr.com/v2
```

If `ADJUTOR_API_KEY` is empty, the code skips the external call. This makes local development and tests easy. In production or deployed review mode, add a real Adjutor API key and keep `KARMA_CHECK_ENABLED=true`.

## Authentication

This MVP uses a faux token authentication system as allowed by the assessment.

Send this header on all protected requests:

```text
Authorization: Bearer demo-credit-test-token
```

The token can be changed through `API_TOKEN` in `.env`.

## API endpoints

Base URL:

```text
/api/v1
```

### Health check

```http
GET /health
```

### Create user and wallet

```http
POST /users
Authorization: Bearer demo-credit-test-token
Content-Type: application/json
```

Request body:

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "phone": "+2347012345678",
  "bvn": "22212345678"
}
```

### Get user and wallet

```http
GET /users/:userId
Authorization: Bearer demo-credit-test-token
```

### Get wallet balance

```http
GET /users/:userId/wallet
Authorization: Bearer demo-credit-test-token
```

### Fund wallet

```http
POST /users/:userId/wallet/fund
Authorization: Bearer demo-credit-test-token
Content-Type: application/json
```

Request body:

```json
{
  "amount": 5000,
  "description": "Loan disbursement"
}
```

### Transfer funds

```http
POST /users/:userId/wallet/transfer
Authorization: Bearer demo-credit-test-token
Content-Type: application/json
```

Request body:

```json
{
  "receiverUserId": "receiver_public_id",
  "amount": 1000,
  "description": "Repayment transfer"
}
```

### Withdraw funds

```http
POST /users/:userId/wallet/withdraw
Authorization: Bearer demo-credit-test-token
Content-Type: application/json
```

Request body:

```json
{
  "amount": 500,
  "description": "Cash withdrawal"
}
```

## Error response format

```json
{
  "status": "error",
  "message": "Insufficient wallet balance",
  "code": "INSUFFICIENT_FUNDS"
}
```

Common errors:

- `401 UNAUTHORIZED` for missing or invalid bearer token.
- `403 KARMA_BLACKLISTED` for blocked onboarding.
- `404 USER_NOT_FOUND` when the user id does not exist.
- `409 USER_ALREADY_EXISTS` for duplicate email, phone, or BVN.
- `422 INSUFFICIENT_FUNDS` for overdraft attempts.
- `422 VALIDATION_ERROR` for invalid request body.

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Update `.env` with your Adjutor API key:

```text
ADJUTOR_API_KEY=your_key_here
```

### 3. Start MySQL

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npm run migrate
```

### 5. Start development server

```bash
npm run dev
```

The service runs at:

```text
http://localhost:3000/api/v1/health
```

## Running tests

```bash
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS wallet_service_test;"
npm test
```

The tests use a separate MySQL test database. Create `wallet_service_test` locally or set `TEST_DB_NAME`, then run `npm test`.

Covered test cases:

- User creation creates wallet.
- Blacklisted user is not onboarded.
- Wallet funding succeeds.
- Transfer succeeds and records a transaction.
- Transfer fails when balance is insufficient.
- Withdrawal succeeds.
- Withdrawal fails on overdraft.
- Protected routes reject missing token.

## Deployment guide: Render free web service

Render is easier than Heroku for a free deployment.

1. Push this folder to GitHub.
2. Create a MySQL database. You can use Railway, Aiven, PlanetScale, or any MySQL provider.
3. Create a Render Web Service from the GitHub repository.
4. Set the build command:

```bash
npm install && npm run build
```

5. Set the start command:

```bash
npm run migrate && npm start
```

6. Add environment variables:

```text
NODE_ENV=production
PORT=10000
API_TOKEN=demo-credit-test-token
DB_HOST=<mysql-host>
DB_PORT=3306
DB_USER=<mysql-user>
DB_PASSWORD=<mysql-password>
DB_NAME=<mysql-db-name>
ADJUTOR_BASE_URL=https://adjutor.lendsqr.com/v2
ADJUTOR_API_KEY=<your-adjutor-api-key>
KARMA_CHECK_ENABLED=true
```

7. After deployment, test:

```bash
curl https://<candidate-name>-lendsqr-be-test.onrender.com/api/v1/health
```

## Deployment guide: Heroku

1. Create a Heroku app named like this:

```text
<candidate-name>-lendsqr-be-test
```

2. Add a MySQL add-on or connect an external MySQL database.
3. Set config vars using the same `.env.example` names.
4. Deploy from GitHub or Heroku CLI.
5. Run migrations:

```bash
heroku run npm run migrate
```

## Design decisions and reasons

### Why TypeScript?

TypeScript improves maintainability by catching wrong request and service shapes early. It also makes the code easier to review because function inputs and expected data are explicit.

### Why Knex?

Knex provides a clean query builder, migrations, and transaction support without hiding SQL too much. This is useful for a wallet system because transaction boundaries and row locking need to be clear.

### Why decimal values for money?

Wallet balances should not use JavaScript floating point arithmetic. The database uses `DECIMAL(18,2)` and the service uses `decimal.js` to avoid precision errors.

### Why a public user id?

The API exposes `public_id` instead of the internal auto-increment id. This avoids leaking database ids and keeps the API safer.

### Why one wallet per user?

This is an MVP. The schema can later support multiple wallets by removing the unique constraint on `wallets.user_id` and adding wallet type or currency rules.

## What I would improve with more time

- Add idempotency keys for fund, transfer, and withdrawal requests.
- Add rate limiting.
- Add a stronger authentication system with JWT or OAuth.
- Add webhook/audit log support.
- Add a ledger double-entry model for stronger financial reconciliation.
- Add integration tests against a real MySQL test container.
- Add OpenAPI/Swagger documentation.
- Add request tracing and structured logs.

## Submission checklist

Submit these items:

1. Public GitHub repository URL.
2. Deployed API URL.
3. Public document URL containing this README/design explanation and the deployed URL.
4. Short video review link. Your face must be visible in the video, even when screen sharing, and it must not exceed 3 minutes.
5. Google Form submission requested in the assessment.
6. Email to `careers@lendsqr.com` confirming submission.

## Suggested short video script

Hello, my name is `<your name>`. This is my Demo Credit wallet service assessment. I built a Node.js TypeScript API using Express, Knex, and MySQL. The API supports account creation, wallet funding, wallet transfer, and withdrawal.

For onboarding, I integrated the Lendsqr Adjutor Karma lookup. When a user signs up, the service checks email, phone, and BVN. If a matching identity is found on Karma, the user is not onboarded.

For wallet operations, I used database transactions so balance updates and transaction records are committed together. For transfers, the sender debit, receiver credit, and transaction record happen in one transaction. I also used decimal handling for money values to avoid floating point issues.

The project includes unit tests for successful flows and negative cases like blacklisted users, insufficient funds, and missing authentication. The README includes the ER diagram, setup instructions, API endpoints, deployment guide, and improvement plan.

Thank you.

## Email template after submission

Subject: Demo Credit Wallet Service Assessment Submission

Hello Lendsqr Team,

I have submitted my Demo Credit wallet service assessment through the Google Form.

GitHub repository: `<repo-url>`
Deployed API: `<service-url>`
Documentation: `<doc-url>`
Video review: `<video-url>`

Thank you for reviewing my submission.

Best regards,
`<your name>`
