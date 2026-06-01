# Demo Credit Wallet Service

This is a Minimum Viable Product wallet API for Demo Credit. Borrowers can create an account, receive loan disbursement into their wallet, transfer funds to another user, and withdraw funds. During onboarding, the service checks the user's identity against Lendsqr Adjutor Karma before creating the wallet.

## Live Service

```
https://bhargav870-lendsqr-be-test-7bd93a7618f9.herokuapp.com
```

## GitHub Repository

```
https://github.com/bhargav870/lendsqr-wallet-service
```

## Tech Stack

- Node.js LTS
- TypeScript
- Express.js
- Knex.js ORM
- MySQL 8
- Jest
- Lendsqr Adjutor Karma API

## Main Features

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

## Architecture Approach

The project uses a small layered architecture:

```
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

## ER Diagram

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

## Database Design

### users
Stores customer identity data needed for onboarding and Karma lookup.
- `email` is unique.
- `phone` is unique when provided.
- `bvn` is unique when provided.
- `public_id` is exposed through API instead of internal database id.

### wallets
Stores one wallet per user.
- `user_id` is unique so a user cannot have multiple wallets in this MVP.
- `balance` is stored as `DECIMAL(18,2)` to avoid floating-point money errors.

### transactions
Stores audit records for all money movement.
- `reference` is unique.
- `type` is one of `FUND`, `TRANSFER`, or `WITHDRAWAL`.
- `source_wallet_id` is nullable for funding.
- `destination_wallet_id` is nullable for withdrawal.

## Lendsqr Adjutor Karma Integration

On user creation, the API checks available identities in this order: email, phone, BVN.

If any identity is found in Karma, onboarding is rejected with `403 KARMA_BLACKLISTED`.

```
GET /verification/karma/:identity
Base URL: https://adjutor.lendsqr.com/v2
```

## Authentication

This MVP uses a faux token authentication system as allowed by the assessment.

```
Authorization: Bearer demo-credit-test-token
```

## API Endpoints

Base URL: `/api/v1`

### Create User and Wallet
```http
POST /users
Authorization: Bearer demo-credit-test-token
Content-Type: application/json

{
  "firstName": "Venkata",
  "lastName": "Bhargav",
  "email": "bhargav@example.com",
  "phone": "+2347012345678",
  "bvn": "22212345678"
}
```

### Get User and Wallet
```http
GET /users/:userId
Authorization: Bearer demo-credit-test-token
```

### Get Wallet Balance
```http
GET /users/:userId/wallet
Authorization: Bearer demo-credit-test-token
```

### Fund Wallet
```http
POST /users/:userId/wallet/fund
Authorization: Bearer demo-credit-test-token

{
  "amount": 5000,
  "description": "Loan disbursement"
}
```

### Transfer Funds
```http
POST /users/:userId/wallet/transfer
Authorization: Bearer demo-credit-test-token

{
  "receiverUserId": "receiver_public_id",
  "amount": 1000,
  "description": "Repayment transfer"
}
```

### Withdraw Funds
```http
POST /users/:userId/wallet/withdraw
Authorization: Bearer demo-credit-test-token

{
  "amount": 500,
  "description": "Cash withdrawal"
}
```

## Error Response Format

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

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Run migrations
npm run migrate

# 4. Start development server
npm run dev
```

## Running Tests

```bash
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS wallet_service_test;"
npm test
```

Covered test cases:
- User creation creates wallet.
- Blacklisted user is not onboarded.
- Wallet funding succeeds.
- Transfer succeeds and records a transaction.
- Transfer fails when balance is insufficient.
- Withdrawal succeeds.
- Withdrawal fails on overdraft.
- Protected routes reject missing token.

## Design Decisions and Reasons

### Why TypeScript?
TypeScript improves maintainability by catching wrong request and service shapes early. It makes the code easier to review because function inputs and expected data are explicit.

### Why Knex?
Knex provides a clean query builder, migrations, and transaction support without hiding SQL too much. This is useful for a wallet system because transaction boundaries and row locking need to be clear.

### Why Decimal Values for Money?
Wallet balances should not use JavaScript floating point arithmetic. The database uses `DECIMAL(18,2)` and the service uses `decimal.js` to avoid precision errors.

### Why a Public User ID?
The API exposes `public_id` instead of the internal auto-increment id. This avoids leaking database ids and keeps the API safer.

### Why One Wallet Per User?
This is an MVP. The schema can later support multiple wallets by removing the unique constraint on `wallets.user_id`.

## What I Would Improve With More Time

- Add idempotency keys for fund, transfer, and withdrawal requests.
- Add rate limiting.
- Add JWT or OAuth authentication.
- Add webhook/audit log support.
- Add OpenAPI/Swagger documentation.
- Add request tracing and structured logs.

## Author

**Venkata Bhargav Sai Kurakula**
GitHub: https://github.com/bhargav870
Deployed API: https://bhargav870-lendsqr-be-test-7bd93a7618f9.herokuapp.com
