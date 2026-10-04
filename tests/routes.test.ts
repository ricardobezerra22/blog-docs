import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
	env: { DATABASE_URL: "postgresql://x", BLOG_API_KEY: "test-key" },
}));

const mockPrisma = {
	post: {
		findMany: vi.fn(),
		count: vi.fn(),
		create: vi.fn(),
		findUnique: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
};

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

// NextRequest is only used for req.nextUrl.searchParams in GET /api/posts.
// Avoid importing next/server in tests by attaching nextUrl manually.
function makeGetReq(url: string) {
	const req = new Request(url) as Request & { nextUrl: URL };
	req.nextUrl = new URL(url);
	return req as unknown as import("next/server").NextRequest;
}

const { GET: listPosts, POST: createPost } = await import("@/app/api/posts/route");
const { GET: getPost, PUT: updatePost, DELETE: deletePost } = await import(
	"@/app/api/posts/[id]/route"
);

const mockPost = {
	id: "post1",
	title: "v1.0 Released",
	slug: "v1-0-released",
	content: "## What's new",
	excerpt: "First release",
	published: true,
	publishedAt: new Date("2026-01-01"),
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-01"),
	tags: [{ name: "Release", slug: "release" }],
};

beforeEach(() => vi.clearAllMocks());

// ─── GET /api/posts ───────────────────────────────────────────────────────────

describe("GET /api/posts", () => {
	it("returns paginated posts with defaults", async () => {
		mockPrisma.post.findMany.mockResolvedValue([mockPost]);
		mockPrisma.post.count.mockResolvedValue(1);

		const res = await listPosts(makeGetReq("http://localhost/api/posts"));
		const body = await res.json();

		expect(res.status).toBe(200);
		expect(body.posts).toHaveLength(1);
		expect(body.total).toBe(1);
		expect(body.page).toBe(1);
		expect(body.limit).toBe(10);
		expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ skip: 0, take: 10 }),
		);
	});

	it("respects page and limit params", async () => {
		mockPrisma.post.findMany.mockResolvedValue([]);
		mockPrisma.post.count.mockResolvedValue(0);

		await listPosts(makeGetReq("http://localhost/api/posts?page=2&limit=5"));

		expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ skip: 5, take: 5 }),
		);
	});

	it("clamps limit to 50", async () => {
		mockPrisma.post.findMany.mockResolvedValue([]);
		mockPrisma.post.count.mockResolvedValue(0);

		await listPosts(makeGetReq("http://localhost/api/posts?limit=999"));

		expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ take: 50 }),
		);
	});
});

// ─── POST /api/posts ──────────────────────────────────────────────────────────

describe("POST /api/posts", () => {
	it("returns 401 without api key", async () => {
		const res = await createPost(
			new Request("http://localhost/api/posts", {
				method: "POST",
				body: "{}",
				headers: { "Content-Type": "application/json" },
			}),
		);
		expect(res.status).toBe(401);
	});

	it("returns 400 when required fields are missing", async () => {
		const res = await createPost(
			new Request("http://localhost/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({ title: "Only a title" }),
			}),
		);
		expect(res.status).toBe(400);
		const body = await res.json();
		expect(body.error).toMatch(/required/);
	});

	it("creates a post with tags and returns 201", async () => {
		mockPrisma.post.create.mockResolvedValue(mockPost);

		const res = await createPost(
			new Request("http://localhost/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({
					title: "v1.0 Released",
					slug: "v1-0-released",
					content: "## What's new",
					tags: [{ name: "Release", slug: "release" }],
				}),
			}),
		);

		expect(res.status).toBe(201);
		const body = await res.json();
		expect(body.slug).toBe("v1-0-released");
	});

	it("creates a published post without tags", async () => {
		mockPrisma.post.create.mockResolvedValue({ ...mockPost, tags: [] });

		const res = await createPost(
			new Request("http://localhost/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({
					title: "v1.0 Released",
					slug: "v1-0-released",
					content: "## What's new",
					published: true,
				}),
			}),
		);

		expect(res.status).toBe(201);
		expect(mockPrisma.post.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ published: true }),
			}),
		);
	});
});

// ─── GET /api/posts/:id ───────────────────────────────────────────────────────

describe("GET /api/posts/:id", () => {
	it("returns post when found", async () => {
		mockPrisma.post.findUnique.mockResolvedValue(mockPost);

		const res = await getPost(new Request("http://localhost/api/posts/post1"), {
			params: Promise.resolve({ id: "post1" }),
		});

		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.id).toBe("post1");
	});

	it("returns 404 when not found", async () => {
		mockPrisma.post.findUnique.mockResolvedValue(null);

		const res = await getPost(new Request("http://localhost/api/posts/nope"), {
			params: Promise.resolve({ id: "nope" }),
		});

		expect(res.status).toBe(404);
	});
});

// ─── PUT /api/posts/:id ───────────────────────────────────────────────────────

describe("PUT /api/posts/:id", () => {
	it("returns 401 without api key", async () => {
		const res = await updatePost(
			new Request("http://localhost/api/posts/post1", {
				method: "PUT",
				body: "{}",
				headers: { "Content-Type": "application/json" },
			}),
			{ params: Promise.resolve({ id: "post1" }) },
		);
		expect(res.status).toBe(401);
	});

	it("updates title and slug", async () => {
		mockPrisma.post.update.mockResolvedValue({ ...mockPost, title: "Updated" });

		const res = await updatePost(
			new Request("http://localhost/api/posts/post1", {
				method: "PUT",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({ title: "Updated", slug: "updated" }),
			}),
			{ params: Promise.resolve({ id: "post1" }) },
		);

		expect(res.status).toBe(200);
		expect(mockPrisma.post.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ title: "Updated", slug: "updated" }),
			}),
		);
	});

	it("sets publishedAt when published becomes true", async () => {
		mockPrisma.post.update.mockResolvedValue(mockPost);

		await updatePost(
			new Request("http://localhost/api/posts/post1", {
				method: "PUT",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({ published: true, content: "updated content" }),
			}),
			{ params: Promise.resolve({ id: "post1" }) },
		);

		expect(mockPrisma.post.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ published: true, publishedAt: expect.any(Date) }),
			}),
		);
	});

	it("clears publishedAt when published becomes false", async () => {
		mockPrisma.post.update.mockResolvedValue({ ...mockPost, published: false });

		await updatePost(
			new Request("http://localhost/api/posts/post1", {
				method: "PUT",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({ published: false }),
			}),
			{ params: Promise.resolve({ id: "post1" }) },
		);

		expect(mockPrisma.post.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ publishedAt: null }),
			}),
		);
	});

	it("replaces tags when provided", async () => {
		mockPrisma.post.update.mockResolvedValue(mockPost);

		await updatePost(
			new Request("http://localhost/api/posts/post1", {
				method: "PUT",
				headers: { "Content-Type": "application/json", "x-api-key": "test-key" },
				body: JSON.stringify({ tags: [{ name: "Fix", slug: "fix" }] }),
			}),
			{ params: Promise.resolve({ id: "post1" }) },
		);

		expect(mockPrisma.post.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ tags: expect.objectContaining({ set: [] }) }),
			}),
		);
	});
});

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────

describe("DELETE /api/posts/:id", () => {
	it("returns 401 without api key", async () => {
		const res = await deletePost(
			new Request("http://localhost/api/posts/post1", { method: "DELETE" }),
			{ params: Promise.resolve({ id: "post1" }) },
		);
		expect(res.status).toBe(401);
	});

	it("deletes post and returns 204", async () => {
		mockPrisma.post.delete.mockResolvedValue(mockPost);

		const res = await deletePost(
			new Request("http://localhost/api/posts/post1", {
				method: "DELETE",
				headers: { "x-api-key": "test-key" },
			}),
			{ params: Promise.resolve({ id: "post1" }) },
		);

		expect(res.status).toBe(204);
		expect(mockPrisma.post.delete).toHaveBeenCalledWith({ where: { id: "post1" } });
	});
});
