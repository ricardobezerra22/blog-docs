# blog-docs API

Base URL: `https://blog-docs-babyguegas-projects.vercel.app`

Authentication: write operations require the header `X-API-Key: <BLOG_API_KEY>`.
Read operations are public — no key needed.

---

## Endpoints

### List posts

```
GET /api/posts
```

Query parameters:

| param | type | default | description |
|-------|------|---------|-------------|
| page  | int  | 1       | page number (1-based) |
| limit | int  | 10      | items per page (max 50) |

Response `200`:

```json
{
  "posts": [
    {
      "id": "cuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string | null",
      "publishedAt": "ISO8601 | null",
      "tags": [{ "name": "string", "slug": "string" }]
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

---

### Get post

```
GET /api/posts/:id
```

Response `200`:

```json
{
  "id": "cuid",
  "title": "string",
  "slug": "string",
  "content": "MDX string",
  "excerpt": "string | null",
  "published": true,
  "publishedAt": "ISO8601 | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "tags": [{ "name": "string", "slug": "string" }]
}
```

Response `404`:

```json
{ "error": "Not found" }
```

---

### Create post

```
POST /api/posts
X-API-Key: <key>
Content-Type: application/json
```

Request body:

```json
{
  "title": "string (required)",
  "slug": "string (required, unique)",
  "content": "MDX string (required)",
  "excerpt": "string (optional)",
  "published": false,
  "tags": [
    { "name": "Release", "slug": "release" }
  ]
}
```

Response `201` — full post object (same shape as GET post).

Response `400`:

```json
{ "error": "title, slug, and content are required" }
```

Response `401`:

```json
{ "error": "Unauthorized" }
```

---

### Update post

```
PUT /api/posts/:id
X-API-Key: <key>
Content-Type: application/json
```

Request body (all fields optional — only sent fields are updated):

```json
{
  "title": "string",
  "slug": "string",
  "content": "MDX string",
  "excerpt": "string",
  "published": true,
  "tags": [{ "name": "string", "slug": "string" }]
}
```

Setting `published: true` sets `publishedAt` to now.
Setting `published: false` clears `publishedAt`.
Providing `tags` replaces the existing tag list.

Response `200` — updated post object.

---

### Delete post

```
DELETE /api/posts/:id
X-API-Key: <key>
```

Response `204` — no body.

---

## Full curl examples

```bash
# List first 5 posts
curl "https://blog-docs-babyguegas-projects.vercel.app/api/posts?limit=5"

# Get a post by id
curl "https://blog-docs-babyguegas-projects.vercel.app/api/posts/cuid123"

# Create a post (draft)
curl -X POST "https://blog-docs-babyguegas-projects.vercel.app/api/posts" \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "v1.2.0 Released",
    "slug": "v1-2-0-released",
    "excerpt": "New agent orchestration features and bug fixes.",
    "content": "## What'\''s new\n\n- Feature A\n- Feature B\n\n## Bug fixes\n\n- Fixed issue X",
    "published": false,
    "tags": [{ "name": "Release", "slug": "release" }]
  }'

# Publish a post
curl -X PUT "https://blog-docs-babyguegas-projects.vercel.app/api/posts/cuid123" \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{ "published": true }'

# Delete a post
curl -X DELETE "https://blog-docs-babyguegas-projects.vercel.app/api/posts/cuid123" \
  -H "X-API-Key: your-key"
```

---

## Error codes

| status | meaning |
|--------|---------|
| 400 | missing required fields |
| 401 | missing or wrong `X-API-Key` |
| 404 | post not found |
| 500 | server error (check Vercel logs) |

---

## Content format (MDX)

`content` is stored as a raw MDX string and rendered server-side. Standard Markdown syntax works. Use frontmatter-free MDX — metadata lives in the DB fields.

```md
## What's new

- Feature A
- Feature B

## Bug fixes

- Fixed issue X

> Note: breaking change in endpoint `/foo`.
```

---

## Agent usage notes

- `slug` must be URL-safe (lowercase, hyphens only). Example: `v1-2-0-released`.
- `id` in GET/PUT/DELETE is the cuid returned by POST or list.
- To publish immediately on creation, set `"published": true` in the POST body.
- Tags are created automatically via `connectOrCreate` — no pre-registration needed.
- Pagination: iterate `page` from 1 until `posts.length < limit`.
- The `content` field is only returned by GET `/api/posts/:id`, not by the list endpoint.
