# micro-banking-core

Noyau backend pour une application de micro‑banque. Logique métier et adaptateurs. Projet majoritairement en TypeScript.

## Quick Start

```bash
git clone https://github.com/niagnouma-corporation/micro-banking-core.git
cd micro-banking-core
npm install        # ou yarn install
cp .env.example .env   # si présent
npm run dev        # vérifier la commande dans package.json
```

## Business Logic

This document describes the core business logic concerning the client lifecycle and associated financial transactions.

### 1. Client Lifecycle

The client lifecycle is based on a 30-day activity period, initiated by a payment.

#### a. Client Creation

- **Flow**: A new client is created by providing personal information and an `montantEngagement` (commitment amount).
- **`montantEngagement`**: This is the registration fee paid by the client. This amount **is not** added to their balance. It serves as a reference for the initial contract.
- **Initial Balance**: The client's `accountBalance` is initialized to **zero**.
- **Validity**: The account is created with an `active` status and an `accountExpiresAt` date set 30 days in the future.
- **Traceability**:
  - A transaction of type `FraisInscription` (Registration Fee) is created in the `Transactions` table to track this fee.
  - An initial support ticket is also created for the client.

#### b. Deposits (Investment)

- **Flow**: Once the account is active, the client can make deposits.
- **Logic**: Any deposited amount is **added** to the client's `accountBalance`.
- **Traceability**: Each deposit generates a `Depot` type transaction in the `Transactions` table.

#### c. End of Cycle and Payout

- **Flow**: At the end of the 30-day period (or manually via the API), the agent can perform a "payout" for the client.
- **Logic**:
  - The entire `accountBalance` is withdrawn.
  - The client's `accountBalance` is reset to **zero**.
  - The account status changes to `expired`.
- **Traceability**: A `Retrait` (Withdrawal) type transaction is created to record the total amount paid out to the client.

#### d. Account Renewal

- **Flow**: A client with an `expired` (or active) account can renew it for a new 30-day cycle.
- **Logic**:
  - The client pays a new fee, called `fraisReactivation` (Reactivation Fee).
  - This amount updates the client's `montantEngagement` for the new cycle.
  - The `accountExpiresAt` date is extended by 30 days.
  - The account status is (re)set to `active`.
  - **Important**: This fee is not added to the client's `accountBalance`.
- **Traceability**: A `FraisReactivation` transaction is created to track the renewal fee.

### 2. Financial Traceability

The `Transactions` table is central to the system. It provides a complete audit trail of all financial flows:

- **`FraisInscription`**: Money received by the company when an account is created.
- **`FraisReactivation`**: Money received by the company when an account is renewed.
- **`Depot`**: Money belonging to the client, added to their balance.
- **`Retrait`**: Money belonging to the client, withdrawn from their balance and returned to them.

This separation ensures clear and precise accounting, distinguishing company revenue from client funds.

## API Documentation

### 1. Authentication API

All authentication endpoints are prefixed with `/api/v1/admin`.

- **POST /api/v1/admin/login**: Authenticate admin and get tokens.
  - **Body**: `{ "username": "admin_username", "password": "admin_password" }`
  - **Response**: `{ "success": true, "message": "Login successful", "data": { "accessToken": "jwt.access.token", "refreshToken": "jwt.refresh.token" } }`

- **POST /api/v1/admin/refresh**: Get a new access token using a refresh token.
  - **Body**: `{ "token": "jwt.refresh.token" }`
  - **Response**: `{ "success": true, "message": "Access token refreshed", "data": { "accessToken": "new.jwt.access.token" } }`

- **POST /api/v1/admin/logout**: Invalidate a refresh token to log out.
  - **Body**: `{ "token": "jwt.refresh.token" }`
  - **Response**: `{ "success": true, "message": "Logout successful" }`

- **GET /api/v1/admin/status**: Check the status of the current session token.
  - **Headers**: `x-auth-token: jwt.access.token`
  - **Response**: `{ "success": true, "message": "Token is valid", "data": { "user": { "id": 1, "username": "admin" }, "expiresAt": "...", "expiresIn": ... } }`

### 2. Client Management API

Client management API routes are prefixed with `/api/v1/clients`. All these routes require authentication via the `x-auth-token` header.

#### a. Create a New Client

- **URL**: `POST /api/v1/clients`
- **Description**: Creates a new client, their initial ticket, and records the registration fee transaction. The client's balance starts at 0.
- **Body (JSON)**:

    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "agentId": 1,
      "montantEngagement": 1000
    }
    ```

- **Success Response**: `{ "success": true, "message": "Client created successfully", "data": { "client": { ... } } }`

#### b. Deposit into a Client Account

- **URL**: `POST /api/v1/clients/:id/deposit`
- **Description**: Adds an amount to the client's `accountBalance` and records a "Depot" type transaction.
- **Body (JSON)**:

    ```json
    {
      "amount": 500
    }
    ```

- **Success Response**: `{ "success": true, "message": "Deposit successful", "data": { "newBalance": 500 } }`

#### c. Renew a Client Account

- **URL**: `POST /api/v1/clients/:id/renew`
- **Description**: Reactivates an account for 30 days, updates the client's commitment amount, and records a "FraisReactivation" transaction.
- **Body (JSON)**:

    ```json
    {
      "fraisReactivation": 1200
    }
    ```

- **Success Response**: `{ "success": true, "message": "Account renewed successfully", "data": { "clientId": "..." } }`

#### d. Payout a Client's Balance

- **URL**: `POST /api/v1/clients/:id/payout`
- **Description**: Empties the client's balance (`accountBalance` becomes 0), marks their account as "expired", and records a "Retrait" transaction.
- **Body**: None
- **Success Response**: `{ "success": true, "message": "Client account paid out successfully", "data": { "clientId": "...", "amountPaidOut": "..." } }`
