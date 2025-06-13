# REST API Plan

## 1. Resources

1. **User** (`auth.users` – managed by Supabase Auth)
   - Authentication, password reset and session management are delegated to Supabase Auth REST helpers.
2. **Flashcard** (`flashcards`)
   - User-owned question–answer pair.
3. **Generation** (`generations`)
   - A single AI generation job containing metadata and suggested flashcards.
4. **Error Log** (`error_logs`)
   - Structured application error report.

---

## 2. Endpoints

(The base path is `/api/v1`)

### 2.1 Authentication (Supabase helpers wrap)

| Method | Path                   | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| POST   | `/auth/register`       | Create new account (email, password). |
| POST   | `/auth/login`          | Obtain JWT access & refresh tokens.   |
| POST   | `/auth/logout`         | Invalidate current refresh token.     |
| POST   | `/auth/reset-password` | Start password-reset e-mail flow.     |

> NOTE : Implementation proxies to Supabase Auth SDK; requests are forwarded directly, tokens are Supabase-issued JWTs. All subsequent endpoints **require** `Authorization: Bearer <JWT>`.

---

### 2.2 Flashcards

| Method    | Path               | Description                                         |
| --------- | ------------------ | --------------------------------------------------- |
| GET       | `/flashcards`      | List flashcards (paginated, filterable & sortable). |
| POST      | `/flashcards`      | Create manual flashcard.                            |
| GET       | `/flashcards/{id}` | Get single flashcard.                               |
| PUT/PATCH | `/flashcards/{id}` | Update flashcard (front/back).                      |
| DELETE    | `/flashcards/{id}` | Permanently delete flashcard.                       |
| POST      | `/flashcards/bulk` | Bulk create (used when accepting generated cards).  |

Query parameters for list endpoint

```
page        integer ≥1    (default 1)
pageSize    integer 10-100 (default 20)
search      string        Full-text search over front+back
sortBy      enum(created_at|updated_at)
order       enum(asc|desc)
```

Request /flashcards (POST & PATCH)

```json
{
  "front": "string (≤200)",
  "back": "string (≤500)"
}
```

Response entity

```json
{
  "id": 123,
  "front": "…",
  "back": "…",
  "source": "manual|ai-full|ai-edited",
  "generationId": "uuid|null",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

Success codes

- 200 OK – retrieve/update
- 201 Created – create/bulk
- 204 No Content – delete

Error codes

- 400 Validation failed (details array)
- 401 Unauthorized
- 403 Forbidden (RLS)
- 404 Not Found (id outside user scope)

---

### 2.3 Generations (AI suggestion workflow)

| Method | Path                           | Description                                                                           |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------- |
| POST   | `/generations`                 | Submit source text to AI → immediate response with queued job & streamed suggestions. |
| GET    | `/generations`                 | List user's previous generations.                                                     |
| GET    | `/generations/{id}`            | Job status & metadata including suggestions.                                          |
| POST   | `/generations/{id}/flashcards` | Accept (optionally edited) suggested cards → bulk insert to `/flashcards`.            |

Request – POST /generations

```json
{
  "sourceText": "string 1000-10000 chars",
  "model": "string (optional)"
}
```

Response – 202 Accepted

```json
{
  "id": "uuid",
  "status": "queued|running|succeeded|failed",
  "createdAt": "ISO-8601"
}
```

When `status = succeeded`, GET /generations/{id} returns

```json
{
  "id": "uuid",
  "modelUsed": "string",
  "generatedCount": 5,
  "suggestions": [{ "front": "…", "back": "…" }],
  "durationMs": 4300,
  "createdAt": "…"
}
```

Accept suggestions (POST /generations/{id}/flashcards)

```json
{
  "flashcards": [
    {
      "front": "string ≤200",
      "back": "string ≤500",
      "edited": true
    }
  ]
}
```

Returns 201 Created with array of persisted flashcards (same shape as §2.2 response). Server updates `accepted_unedited_count` accordingly.

---

### 2.4 Error Logs (internal/admin)

| Method | Path          | Description                            |
| ------ | ------------- | -------------------------------------- |
| POST   | `/error-logs` | Record client-side error (public).     |
| GET    | `/error-logs` | Admin-only: list logs, filter by user. |

POST payload

```json
{
  "errorMessage": "string"
}
```

---

## 3. Authentication & Authorisation

1. **JWT** – All endpoints except registration/login use the `Authorization` header with Supabase JWT.
2. **Row-Level Security** – PostgreSQL RLS policies defined in schema ensure user isolation.
3. **Role-based flags** – Admin role (JWT claim `role=admin`) bypasses RLS for `/error-logs` aggregation.
4. **Rate limiting** – API Gateway limits: 100 req/min per IP, 1000 req/day per authenticated user.

## 4. Validation & Business Rules

### Flashcards

- `front` ≤ 200 chars, not empty.
- `back` ≤ 500 chars, not empty.
- `source` auto-set by server (`manual` for POST /flashcards; `ai-full|ai-edited` during generation acceptance).
- `generation_id` nullable; must reference valid generation belonging to the user.

### Generations

- `sourceText` length 1000-10000 chars (CHECK).
- Max 1 concurrent generation per user; subsequent requests return `429 Too Many Requests`.
- AI job timeout 60 s; errors recorded in `error_logs`.

### Reviews

- `rating` must be one of enum `hard|medium|easy`. Maps to algorithm parameters.

### Error Logs

- `errorMessage` non-empty string ≤ 10 000 chars.

## 5. Pagination / Sorting / Filtering Conventions

- `page`, `pageSize` pagination (header `X-Total-Count` returns overall count).
- `search` performs full-text search using `gin_flashcard_content` index.
- `sortBy` + `order` map to indexed columns; default `created_at desc`.

## 6. Security & Performance Considerations

- HTTPS enforced; HSTS 1y.
- Using PostgREST style policies plus serverless function wrappers in `/src/pages/api`.
- AI generation executed as background job to avoid blocking. Progress via SSE (`text/event-stream`) from GET /generations/{id}/events.
- Webhooks protect against replay with HMAC.
- Input size limits (body ≤1 MB except /generations ‑ 15 KB).
- Structured error responses `{ "error": { "code": "string", "message": "string" } }`.

## 7. Versioning Strategy

- URI version (`/api/v1`). Future breaking changes increment the number.

## 8. OpenAPI & Documentation

- Complete OpenAPI 3.1 spec auto-generated from TypeScript Zod schemas (`src/lib/validators`).
- Swagger UI served at `/docs` (dev-only) and ReDoc static page in production.
