---
description: Design predictable, versioned REST APIs with correct HTTP semantics, pagination, idempotency and observability
globs: ["**/api/**", "**/routes/**", "**/server/**", "apps/api/**", "apps/**/app/api/**", "**/*.service.ts"]
---

# REST API Design Rules (MANDATORY)

When designing or changing any backend endpoint, follow these 10 principles.
They are a contract between independent pieces of software — the client MUST NOT
need to understand your database tables, service structure, or internals.

## 1. Design Around Resources, Not Database Tables

- URLs identify resources; HTTP methods describe the operation.
- NEVER embed verbs in URLs (`/createUser`, `/getUsers`).

```text
GET    /api/v1/products
GET    /api/v1/products/482
POST   /api/v1/products
PATCH  /api/v1/products/482
DELETE /api/v1/products/482
```

- An action-oriented endpoint is allowed only when no clean resource exists
  (e.g. `POST /orders/812/cancel`). Prefer resources by default.

## 2. Use HTTP Methods According to Their Semantics

- `GET` retrieves without state change. `POST` creates a subordinate resource
  or triggers processing. `PUT` replaces the full resource. `PATCH` partially
  modifies. `DELETE` removes.
- NEVER use `POST` for everything.

```http
PATCH /api/v1/users/42
Content-Type: application/json

{ "displayName": "Gopi" }
```

- Respect idempotency: `GET`, `PUT`, `DELETE` are idempotent by semantics;
  `POST` is not. Design retries accordingly (see rule 7).

## 3. Make Response Format Predictable

- Use ONE error envelope across all endpoints:

```json
{
  "type": "https://api.example.com/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "errors": { "email": "Enter a valid email address." }
}
```

- NEVER return `200 OK` with `"success": false`. Use real status codes:
  `400` invalid, `401` unauthenticated, `403` unauthorized, `404` not found,
  `409` conflict, `429` rate-limited, `5xx` server failure.
- NEVER mix shapes (`{error: "..."}` on one endpoint, `{message, fields}` on another).

## 4. Keep Request and Response Schemas Explicit

- Expose a deliberate representation, NEVER the raw database row:

```typescript
// NEVER return this
// { _id, passwordHash, internalRoleId, email, createdAt }

// Return this
interface PublicUser {
  id: string
  email: string
  createdAt: string
}
```

- Validate at the API boundary: required fields, types, ranges, formats,
  business rules (reject `"quantity": -7` before it reaches domain logic).
- Treat unexpected client properties as untrusted — whitelist, don't passthrough.

## 5. Design Pagination Before Lists Become Huge

- NEVER return unbounded collections (`GET /orders` with no limit).
- Offset style for small, page-jumping UIs:

```text
GET /api/v1/orders?limit=20&offset=40
```

```json
{ "items": [{ "id": "481", "total": 129.5 }], "limit": 20, "offset": 40 }
```

- Cursor style for large or frequently-changing datasets:

```text
GET /api/v1/orders?limit=20&after=eyJpZCI6NDgwfQ==
```

- Cursor MUST be built on a stable ordering. Document which mode each
  collection uses and keep the envelope consistent.

## 6. Treat Authentication and Authorization as Different Problems

- Authentication = who are you. Authorization = are you allowed.
- NEVER treat "logged in" as "allowed":

```typescript
// ❌ BAD — checks identity only
if (req.user) {
  return getOrder(req.params.id)
}

// ✅ GOOD — explicit access decision
if (order.userId !== req.user.id && !req.user.isAdmin) {
  return res.status(403).json({ title: "Forbidden", status: 403 })
}
```

- Centralize policy (roles, ownership, org membership) and test it.
  Frontend permission checks are UI hints only — the backend enforces.

## 7. Design for Retries and Idempotency

- Any mutating endpoint can receive the same request twice (timeout, lost
  response, mobile network switch). For side effects (payments, orders),
  require an idempotency key:

```http
POST /api/v1/payments
Idempotency-Key: 7b3c9f2a-0000-4000-8000-ffffffffffff
```

```typescript
const existing = await idempotencyStore.find(key)
if (existing) {
  return res.status(existing.status).json(existing.response)
}
const payment = await processPayment(req.body)
await idempotencyStore.save(key, { status: 201, response: payment })
return res.status(201).json(payment)
```

- Production stores MUST handle concurrency, expiry, key→request-fingerprint
  mismatch, and halfway failures. Idempotency is storage + workflow, not just a header.

## 8. Version APIs for Change, Not Decoration

- Additive changes (new optional field) usually need no new version.
  Breaking changes (remove/rename field, change type or meaning, new required
  input) need a migration path:

```text
/api/v1/users/42
/api/v2/users/42
```

- Before changing a contract ask: who consumes it, can clients migrate
  independently, how long is the old version supported, how is deprecation
  announced and measured. NEVER keep `v1` alive forever without a sunset plan.

## 9. Add Rate Limiting Where Abuse or Overload Is Possible

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
Content-Type: application/json

{ "title": "Too many requests", "status": 429 }
```

- Choose strategy per endpoint (fixed/sliding window, token bucket,
  distributed counter). Login and expensive search get tighter limits than
  lightweight reads.
- Limit by account/API key/tenant + endpoint, not IP alone (shared NAT,
  corporate proxies). Multi-instance enforcement needs shared state.

## 10. Design APIs for Observability and Failure

- Propagate a request ID and log it on every hop:

```http
X-Request-ID: 8e3d4c1a-0000-4000-8000-ffffffffffff
```

```text
request_id=8e3d4c1a route=/api/v1/orders method=POST status=201 duration_ms=184
```

- Track volume, error rate, and latency percentiles (`p95`/`p99`, not just mean).
- Failure bodies tell clients how to react without leaking internals.
  NEVER return SQL, stack traces, or service topology in responses.

## Pre-Merge Checklist

- [ ] Resources + methods follow rules 1–2 (no verb URLs, no POST-for-all)
- [ ] Error envelope + status codes follow rule 3
- [ ] Request/response schemas whitelisted per rule 4 (no secret/internal fields)
- [ ] Every list endpoint paginated per rule 5
- [ ] AuthZ decision explicit per resource per rule 6
- [ ] Side-effect retries safe per rule 7 (`Idempotency-Key` where needed)
- [ ] Change classified additive vs breaking + deprecation noted per rule 8
- [ ] Rate limits set per rule 9 on auth/mutation/expensive reads
- [ ] Request ID + logs + metrics covered per rule 10

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-10-04 | Initial REST API design rules distilled from backend principles |
