import { afterEach, describe, expect, it, vi } from "vitest";

// Each test resets modules so the module-level safeParse re-runs with the current process.env.
describe("lib/env.ts", () => {
	const saved: Record<string, string | undefined> = {};

	afterEach(() => {
		process.env.DATABASE_URL = saved.DATABASE_URL;
		process.env.BLOG_API_KEY = saved.BLOG_API_KEY;
		vi.resetModules();
	});

	it("exports env when all required vars are set", async () => {
		saved.DATABASE_URL = process.env.DATABASE_URL;
		saved.BLOG_API_KEY = process.env.BLOG_API_KEY;

		process.env.DATABASE_URL = "postgresql://localhost/test";
		process.env.BLOG_API_KEY = "my-secret";
		vi.resetModules();

		const { env } = await import("@/lib/env");
		expect(env.DATABASE_URL).toBe("postgresql://localhost/test");
		expect(env.BLOG_API_KEY).toBe("my-secret");
	});

	it("throws when DATABASE_URL is missing", async () => {
		saved.DATABASE_URL = process.env.DATABASE_URL;
		saved.BLOG_API_KEY = process.env.BLOG_API_KEY;

		delete process.env.DATABASE_URL;
		process.env.BLOG_API_KEY = "my-secret";
		vi.resetModules();

		await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
	});

	it("throws when BLOG_API_KEY is missing", async () => {
		saved.DATABASE_URL = process.env.DATABASE_URL;
		saved.BLOG_API_KEY = process.env.BLOG_API_KEY;

		process.env.DATABASE_URL = "postgresql://localhost/test";
		delete process.env.BLOG_API_KEY;
		vi.resetModules();

		await expect(import("@/lib/env")).rejects.toThrow("Invalid environment variables");
	});
});
