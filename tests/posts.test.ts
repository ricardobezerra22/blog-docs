import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
	env: { DATABASE_URL: "postgresql://x", BLOG_API_KEY: "secret-key" },
}));

const { requireApiKey } = await import("@/lib/auth");

describe("requireApiKey", () => {
	it("returns 401 when header is missing", async () => {
		const req = new Request("http://localhost/api/posts", { method: "POST" });
		const res = requireApiKey(req);
		expect(res).not.toBeNull();
		expect(res?.status).toBe(401);
	});

	it("returns 401 when key is wrong", async () => {
		const req = new Request("http://localhost/api/posts", {
			method: "POST",
			headers: { "x-api-key": "wrong" },
		});
		const res = requireApiKey(req);
		expect(res?.status).toBe(401);
	});

	it("returns null when key is correct", async () => {
		const req = new Request("http://localhost/api/posts", {
			method: "POST",
			headers: { "x-api-key": "secret-key" },
		});
		expect(requireApiKey(req)).toBeNull();
	});
});
