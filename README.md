# Text Justification API

A small Node.js + TypeScript API that justifies plain text to a fixed line length (80 characters) and tracks user daily usage.

---

## Features

- Text justification to 80-character lines (preserves words and left-aligns the last line).
- JWT-based authentication for protected endpoints.
- Daily usage limits (word count) enforced by middleware.
- Usage stored in Redis (Upstash).
- Coverage and tests using Jest + Supertest.

---

## Technologies

- Node.js + TypeScript
- Express
- JSON Web Tokens (jsonwebtoken)
- Upstash Redis client (@upstash/redis)
- Jest + Supertest for testing

---

## Quick start

1. Clone and install dependencies

```powershell
git clone <repo-url>
cd text-justifier-api
npm install
```
2. Create a `.env` file (see Environment variables below)

3. Run in development

```powershell
npm run dev
```

4. Build for production

```powershell
npm run build
npm start
```

---

## Environment variables

Create a `.env` file at the project root with at least the following values:

- JWT_SECRET - secret used to sign and verify JWTs
- UPSTASH_REDIS_REST_URL - Upstash REST URL for Redis
- UPSTASH_REDIS_REST_TOKEN - Upstash REST token
- PORT - (optional) port to run the server (defaults to 3000)

This project uses Redis for usage tracking. You should provide a Redis connection when running this app — for example Upstash (managed) or a local Redis instance. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for Upstash, or adapt `src/redis/usageStore.ts` for your redis instance.

---

## Project structure

```
src/
├─ controllers/          # optional controller shims
├─ controllers.ts        # justification and token handlers
├─ middlewares/         # auth and usage middleware
├─ constants.ts          # project-wide constants (LINE_LENGTH, WORD_LIMIT)
├─ redis/               # usage store (Upstash client + helpers)
├─ routes/              # express routers (auth, justify)
└─ server.ts            # app entrypoint

tests/                  # Jest + Supertest tests
package.json
tsconfig.json
```

---

## API endpoints

- POST /api/token
  - Body: { "email": "user@example.com" }
  - Returns: { "token": "<jwt>" }

- POST /api/justify
  - Content-Type: text/plain
  - Authorization: Bearer <token>
  - Body: raw text to justify
  - Returns: justified text as `text/plain`

Notes: The `/api/justify` endpoint requires a valid JWT and will increment the user's daily usage by the number of words in the request. If the user exceeds the configured daily word limit the request will be rejected.

---

## Testing

Run the test suite with:

```powershell
npm test
```

Tests are implemented with Jest and Supertest.

---

## Contributing

Contributions are welcome! If you'd like to contribute:

1. Fork the repository and create a topic branch for your work.
2. Make your changes on the branch and include tests for new behavior.
3. Open a pull request back to this repository's `master` branch with a clear description of the change.

Happy coding!



