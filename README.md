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

#### A. Initial Login

To log in, make a POST request to the `/api/v1/admin/login` endpoint. Store the `accessToken` and `refreshToken` received in the response.

```javascript
// Example using fetch
async function login(username, password) {
  try {
    const response = await fetch('/api/v1/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      console.log('Login successful!');
    } else {
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Network error during login:', error);
  }
}

// Example usage:
// login('your_admin_username', 'your_admin_password');
```

#### B. Accessing Protected Routes

For any API endpoint that requires authentication, include the `accessToken` in the `x-auth-token` header.

```javascript
// Example using fetch to access a protected route
async function getProtectedData() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    console.error('No access token found. Please log in.');
    return;
  }

  try {
    const response = await fetch('/api/v1/admin/profile', { // Example protected route
      method: 'GET',
      headers: {
        'x-auth-token': accessToken,
      },
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Protected data:', data);
    } else if (response.status === 401 || response.status === 403) {
      console.warn('Access token expired or invalid. Attempting to refresh...');
      // Implement token refresh logic here
    } else {
      console.error('Failed to fetch protected data:', response.statusText);
    }
  } catch (error) {
    console.error('Network error fetching protected data:', error);
  }
}

// Example usage:
// getProtectedData();
```

#### C. Refreshing Access Token

When an `accessToken` expires, use the `refreshToken` to obtain a new one without requiring the user to re-enter credentials.

```javascript
// Example using fetch to refresh token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.error('No refresh token found. Please log in.');
    return null;
  }

  try {
    const response = await fetch('/api/v1/admin/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      console.log('Access token refreshed successfully!');
      return data.data.accessToken;
    } else {
      console.error('Failed to refresh token:', data.message);
      // Potentially clear tokens and force re-login if refresh token is invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  } catch (error) {
    console.error('Network error during token refresh:', error);
  }
  return null;
}

// Example usage (integrate with protected route logic):
// async function getProtectedDataWithRefresh() {
//   let accessToken = localStorage.getItem('accessToken');
//   // Try initial fetch
//   const response = await fetch('/api/v1/admin/profile', { /* ... */ });
//   if (response.status === 401 || response.status === 403) {
//     accessToken = await refreshAccessToken();
//     if (accessToken) {
//       // Retry fetch with new token
//       const retryResponse = await fetch('/api/v1/admin/profile', { /* ... new token */ });
//       // ... handle retry response
//     }
//   }
//   // ...
// }
```

#### D. Logout

To log out, send a POST request to the `/api/v1/admin/logout` endpoint with the `refreshToken`. After a successful logout, clear all stored tokens from the frontend.

```javascript
// Example using fetch to logout
async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.warn('No refresh token found. Already logged out or session expired.');
    return;
  }

  try {
    const response = await fetch('/api/v1/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });
    const data = await response.json();
    if (data.success) {
      console.log('Logout successful!');
    } else {
      console.error('Logout failed:', data.message);
    }
  } catch (error) {
    console.error('Network error during logout:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('All tokens cleared.');
  }
}

// Example usage:
// logout();
```