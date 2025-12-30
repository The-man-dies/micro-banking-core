# micro-banking-core

Noyau backend pour une application de micro‑banque. Logique métier et adaptateurs. Projet majoritairement en TypeScript.

## Quick start
```bash
git clone https://github.com/niagnouma-corporation/micro-banking-core.git
cd micro-banking-core
npm install        # ou yarn install
cp .env.example .env   # si présent
npm run dev        # vérifier la commande dans package.json
```

## Frontend Authentication Guide

This guide outlines how frontend developers can integrate with the micro-banking-core authentication API.

### 1. API Endpoints

All authentication endpoints are prefixed with `/api/v1/admin`.

*   **POST /api/v1/admin/login**: Authenticate admin and get tokens.
    *   **Body**: `{ "username": "admin_username", "password": "admin_password" }`
    *   **Response**: `{ "success": true, "message": "Login successful", "data": { "accessToken": "jwt.access.token", "refreshToken": "jwt.refresh.token" } }`
*   **POST /api/v1/admin/refresh**: Get a new access token using a refresh token.
    *   **Body**: `{ "token": "jwt.refresh.token" }`
    *   **Response**: `{ "success": true, "message": "Access token refreshed", "data": { "accessToken": "new.jwt.access.token" } }`
*   **POST /api/v1/admin/logout**: Invalidate a refresh token to log out.
    *   **Body**: `{ "token": "jwt.refresh.token" }`
    *   **Response**: `{ "success": true, "message": "Logout successful" }`
*   **GET /api/v1/admin/status**: Check the status of the current session token.
    *   **Headers**: `x-auth-token: jwt.access.token`
    *   **Response**: `{ "success": true, "message": "Token is valid", "data": { "user": { "id": 1, "username": "admin" }, "expiresAt": "...", "expiresIn": ... } }`

### 2. Authentication Flow
(Le reste du guide d'authentification reste inchangé)


## Gestion des Clients (API)

Les routes de l'API pour la gestion des clients sont préfixées par `/api/v1/clients`. Toutes ces routes nécessitent une authentification via le header `x-auth-token`.

### 1. Créer un nouveau client

*   **URL** : `POST /api/v1/clients`
*   **Description** : Crée un nouveau client, son ticket initial, et enregistre la transaction des frais d'inscription. Le solde du client commence à 0.
*   **Body (JSON)** :
    ```json
    {
      "firstname": "John",
      "lastname": "Doe",
      "email": "john.doe@example.com",
      "agentId": 1,
      "montantEngagement": 1000
    }
    ```
*   **Réponse de succès** : `{ "success": true, "message": "Client created successfully", "data": { "client": { ... } } }`

### 2. Effectuer un dépôt sur un compte client

*   **URL** : `POST /api/v1/clients/:id/deposit`
*   **Description** : Ajoute un montant au solde (`accountBalance`) du client et enregistre une transaction de type "Depot".
*   **Body (JSON)** :
    ```json
    {
      "amount": 500
    }
    ```
*   **Réponse de succès** : `{ "success": true, "message": "Deposit successful", "data": { "newBalance": 500 } }`

### 3. Renouveler un compte client

*   **URL** : `POST /api/v1/clients/:id/renew`
*   **Description** : Réactive un compte pour 30 jours, met à jour le montant d'engagement du client, et enregistre une transaction de type "FraisReactivation".
*   **Body (JSON)** :
    ```json
    {
      "fraisReactivation": 1200
    }
    ```
*   **Réponse de succès** : `{ "success": true, "message": "Account renewed successfully", "data": { "clientId": "..." } }`

### 4. Effectuer le retrait du solde d'un client (Payout)

*   **URL** : `POST /api/v1/clients/:id/payout`
*   **Description** : Vide le solde du client (`accountBalance` passe à 0), marque son compte comme "expired", et enregistre une transaction de type "Retrait".
*   **Body** : Aucun
*   **Réponse de succès** : `{ "success": true, "message": "Client account paid out successfully", "data": { "clientId": "...", "amountPaidOut": "..." } }`