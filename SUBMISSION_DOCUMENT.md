# Demo Credit Wallet Service - Submission Document

## Review of work done

I built an MVP wallet service for Demo Credit using Node.js, TypeScript, Express, Knex.js, and MySQL.

The service supports:

- User account creation.
- Automatic wallet creation for each user.
- Wallet funding.
- Wallet-to-wallet transfer.
- Wallet withdrawal.
- Lendsqr Adjutor Karma blacklist check before onboarding.
- Faux bearer-token authentication.
- Unit tests for positive and negative scenarios.

## Path to service

Deployed API URL:

```text
https://<candidate-name>-lendsqr-be-test.<cloud-platform-domain>
```

Health endpoint:

```text
https://<candidate-name>-lendsqr-be-test.<cloud-platform-domain>/api/v1/health
```

## GitHub repository

```text
https://github.com/<github-username>/lendsqr-wallet-service
```

## Why I used this design

I separated the code into routes, controllers, services, middleware, and migrations. This keeps the API easy to understand and makes business logic easier to test.

All wallet money operations are handled inside database transactions. For example, a transfer debits the sender wallet, credits the receiver wallet, and creates the transaction record in one transaction. If any step fails, the full operation rolls back.

Money values are stored as `DECIMAL(18,2)` in MySQL and handled with `decimal.js` in the service layer to avoid floating-point precision errors.

The API uses `public_id` for users instead of exposing internal database ids.

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

## API endpoints

All protected endpoints require:

```text
Authorization: Bearer demo-credit-test-token
```

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Check service status |
| POST | `/api/v1/users` | Create user and wallet |
| GET | `/api/v1/users/:userId` | Get user and wallet |
| GET | `/api/v1/users/:userId/wallet` | Get wallet balance |
| POST | `/api/v1/users/:userId/wallet/fund` | Fund wallet |
| POST | `/api/v1/users/:userId/wallet/transfer` | Transfer to another user |
| POST | `/api/v1/users/:userId/wallet/withdraw` | Withdraw funds |

## Testing

Run:

```bash
npm test
```

The tests cover:

- User and wallet creation.
- Blacklisted user rejection.
- Wallet funding.
- Transfer success.
- Transfer with insufficient funds.
- Withdrawal success.
- Withdrawal overdraft rejection.
- Missing token rejection.

## What I would improve next

- Add idempotency keys for wallet operations.
- Add JWT authentication.
- Add OpenAPI documentation.
- Add full MySQL integration tests in CI.
- Add a double-entry ledger for stronger reconciliation.
- Add structured logging and tracing.
