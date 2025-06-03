# Authorization and Authentication
*This repository is focused on implementing authorization and authentication, primarily based on the OAuth 2.0 and OpenID Connect (OIDC) protocols, with the goal of better understanding the Authorization Code Flow.*


### 🚀 Getting Started
```
git clone https://github.com/Shimmyland/nodejs-auth.git
cd nodejs-auth
npm install
npm run compile
npm run api
```

### 🔐 Password Hashing (bcrypt)
- Registration:
    - Receive user data
    - Hash the password using `bcrypt.hash()`
    - Store the hashed password in the database with salt and cost factor
- Login (Authentication):
    - User submits credentials
    - Compare submitted password with stored hash using `bcrypt.compare()`
    - On success, issue a JWT

### 🔑 JSON Web Tokens (JWT)
- Registration: hash the password and save user data
- Login: compare hashed passwords, generate and return a JWT
- Protected Endpoints:
    - Validate incoming requests using the `Authorization` header
    - Return `401 Unauthorized` if the token is invalid or missing

### 🌐 OAuth 2.0 & OpenID Connect Flow
- User is redirected to the OAuth provider (e.g., Google)
- User logs in and authorizes the app
- Provider redirects back with a `?code=...`
- Backend:
    - Exchanges the code for an `access_token` (and optionally `id_token`, `refresh_token`)
    - Fetches user data from the provider using the `access_token`
    - Decodes and verifies the `id_token` (if using OpenID Connect)
    - Saves or updates the user in the database
    - Issues a JWT or HTTP-only session cookie to the user

### 🗃️ Stored User Data
Example of what is saved in the database:
- Internal user ID
- OAuth provider name
- OAuth user ID
- Email
- Name
- Avatar (nullable)
- Access token
- Token expiration time
- Refresh token (if available)
- ID token (if using OIDC)

### 🛫 Takeaways (for now)
- OAuth 2.0 is **authorization** protocol (offers authentication only if the provider returns user's identity)
- never expose your access tokens or client secrets in frontend code
- implementing OIDC basically means decoding the `id_token` (JWT with identity) to retrieve user data
- GitHub and Discord support only OAuth 2.0, whereas Google also supports OIDC
- store JWT in `httpOnly cookie` (automatically send with each request, if `withCredentials` is set)


> ⚠️ **Note:** Some parts of this README has been written with the help of AI – the author prefers writing code over writing English.







