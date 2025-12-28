# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://swc.rs/) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Backend API Endpoints

This section documents the backend API endpoints available for the frontend to consume. The base URL for all API requests is typically `/api/v1`.

### Admin Authentication Endpoints (`/api/v1/admin`)

*   **`POST /api/v1/admin/login`**
    *   **Description:** Authenticates an admin user and returns access and refresh tokens.
    *   **Body:** `{ "username": "string", "password": "string" }`
    *   **Response (Success 200):** `{ "accessToken": "jwt", "refreshToken": "jwt" }`
    *   **Access:** Public
*   **`GET /api/v1/admin/status`**
    *   **Description:** Checks the validity of the current access token.
    *   **Headers:** `x-auth-token: <accessToken>`
    *   **Response (Success 200):** `{ "user": { "id": "number", "username": "string" }, "expiresAt": "date_string", "expiresIn": "seconds" }`
    *   **Access:** Private (Admin)

### Agent Endpoints (`/api/v1/agents`)

All agent endpoints require admin authentication (`x-auth-token` header).

*   **`POST /api/v1/agents`**
    *   **Description:** Creates a new agent.
    *   **Body:** `{ "firstname": "string", "lastname": "string", "email": "string?", "location": "string?" }`
    *   **Access:** Private (Admin)
*   **`GET /api/v1/agents`**
    *   **Description:** Retrieves all agents.
    *   **Access:** Private (Admin)
*   **`GET /api/v1/agents/:id`**
    *   **Description:** Retrieves an agent by ID.
    *   **Access:** Private (Admin)
*   **`PUT /api/v1/agents/:id`**
    *   **Description:** Updates an agent by ID.
    *   **Body:** `Partial<AgentType>`
    *   **Access:** Private (Admin)
*   **`DELETE /api/v1/agents/:id`**
    *   **Description:** Deletes an agent by ID.
    *   **Access:** Private (Admin)

### Ticket Endpoints (`/api/v1/tickets`)

All ticket endpoints require admin authentication (`x-auth-token` header).

*   **`POST /api/v1/tickets`**
    *   **Description:** Creates a new ticket.
    *   **Body:** `{ "description": "string?", "status": "active" | "closed" | "pending", "clientId": "string" }`
    *   **Access:** Private (Admin)
*   **`GET /api/v1/tickets`**
    *   **Description:** Retrieves all tickets.
    *   **Access:** Private (Admin)
*   **`GET /api/v1/tickets/:id`**
    *   **Description:** Retrieves a ticket by ID.
    *   **Access:** Private (Admin)
*   **`PUT /api/v1/tickets/:id`**
    *   **Description:** Updates a ticket by ID.
    *   **Body:** `Partial<TicketType>`
    *   **Access:** Private (Admin)
*   **`DELETE /api/v1/tickets/:id`**
    *   **Description:** Deletes a ticket by ID.
    *   **Access:** Private (Admin)

### Client Endpoints (`/api/v1/clients`)

All client endpoints require admin authentication (`x-auth-token` header).

*   **`POST /api/v1/clients`**
    *   **Description:** Creates a new client and an associated unique ticket. Account starts with 0 balance, 30 days validity, and 'active' status.
    *   **Body:** `{ "firstname": "string", "lastname": "string", "email": "string?", "agentId": "string", "initialDeposit": "number" }`
    *   **Access:** Private (Admin)
*   **`GET /api/v1/clients`**
    *   **Description:** Retrieves all clients.
    *   **Access:** Private (Admin)
*   **`GET /api/v1/clients/:id`**
    *   **Description:** Retrieves a client by ID.
    *   **Access:** Private (Admin)
*   **`PUT /api/v1/clients/:id`**
    *   **Description:** Updates a client by ID.
    *   **Body:** `Partial<ClientType>`
    *   **Access:** Private (Admin)
*   **`DELETE /api/v1/clients/:id`**
    *   **Description:** Deletes a client by ID.
    *   **Access:** Private (Admin)
*   **`POST /api/v1/clients/:id/renew`**
    *   **Description:** Renews a client's account for 30 days. Requires `accountBalance >= initialDeposit`. Deducts `initialDeposit` from balance.
    *   **Access:** Private (Admin), requires `x-auth-token`.
*   **`POST /api/v1/clients/:id/deposit`**
    *   **Description:** Deposits funds into a client's account. Blocked if account is expired.
    *   **Body:** `{ "amount": "number" }`
    *   **Access:** Private (Admin), requires `x-auth-token`.