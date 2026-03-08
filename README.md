# AI-Powered Local Services Marketplace

Next.js marketplace frontend with decoupled proxy integration to a separate NestJS AI agent backend.

## New Backend Modes Covered

- Anonymous public search
  - Backend: `POST /api/v1/public/agent/marketplace`
  - Frontend call: `POST /agent/marketplace` (no JWT)
- Authenticated search (history persistence)
  - Backend: `POST /api/v1/agent/marketplace`
  - Frontend call: `POST /agent/marketplace` (JWT is sent via secure cookie after login)
- Admin manual listings
  - Backend: `POST /api/v1/admin/listings`, `GET /api/v1/admin/listings`
  - Frontend calls: `POST/GET /agent/admin/listings` (uses admin session cookie)

## Proxy Architecture

- Browser never calls NestJS directly.
- Browser only calls Next.js routes:
  - `POST /agent/marketplace`
  - `GET /agent/admin/listings`
  - `POST /agent/admin/listings`
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/logout`
- Next.js routes forward to NestJS backend using server-side env vars.

## Environment

Set in `.env.local`:

```env
AGENT_API_BASE_URL=http://localhost:4000
```

## Local Run

```bash
# terminal 1 - NestJS agent
npm run start:dev

# terminal 2 - this Next.js app
npm run dev
```

Pages:

- Search UI: `http://localhost:3000/agent-marketplace`
- Admin login: `http://localhost:3000/admin/login`
- Admin register: `http://localhost:3000/admin/register`
- Admin listings UI: `http://localhost:3000/admin`

## Error Handling

Consistent proxy error JSON examples:

```json
{ "error": "Invalid input" }
```

```json
{ "error": "No providers found" }
```

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "Agent service unavailable" }
```

```json
{ "error": "Agent request timed out" }
```
